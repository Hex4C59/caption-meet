# Launch a dedicated Debug SFU under this observer; never attach to another server.
# Usage: gdb -q -nx --batch -x scripts/baseline/pre-stun-observe.gdb --args RTCPilot config
set pagination off
set confirm off
set breakpoint pending off
set print thread-events off
set debuginfod enabled off
set disable-randomization off
handle SIGTERM nostop noprint pass

python
import gdb
import json
import time

resource_types = (
    "WebRtcSession",
    "MediaPusher",
    "MediaPuller",
    "RtpRecvSession",
    "DtlsSession",
    "SRtpSession",
    "IceServer",
)
live_objects = {name: set() for name in resource_types}
constructed = {name: 0 for name in resource_types}
destroyed = {name: 0 for name in resource_types}
probe_errors = []
stun_calls = 0
sample_index = 0
started_ns = time.monotonic_ns()
observer_breakpoints = []


def report_error(context, error):
    message = "{}: {}".format(context, error)
    if message not in probe_errors and len(probe_errors) < 20:
        probe_errors.append(message)


def read_count(expression):
    try:
        return int(gdb.parse_and_eval(expression))
    except Exception as error:
        report_error("count read", error)
        return None


class LifetimeBreakpoint(gdb.Breakpoint):
    def __init__(self, resource, creating):
        method = resource if creating else "~" + resource
        specification = "cpp_streamer::{}::{}".format(resource, method)
        super().__init__(specification, internal=True)
        self.silent = True
        self.resource = resource
        self.creating = creating

    def stop(self):
        try:
            address = int(gdb.parse_and_eval("this"))
            active = live_objects[self.resource]
            # GCC can resolve constructor/destructor variants to multiple locations.
            # Count each object's lifetime once, without emitting its address.
            if self.creating:
                if address not in active:
                    active.add(address)
                    constructed[self.resource] += 1
            elif address in active:
                active.discard(address)
                destroyed[self.resource] += 1
        except Exception as error:
            report_error(self.resource + " lifetime", error)
        return False


class StunBreakpoint(gdb.Breakpoint):
    def __init__(self):
        super().__init__("cpp_streamer::WebRtcServer::HandleStunPacket", internal=True)
        self.silent = True

    def stop(self):
        global stun_calls
        stun_calls += 1
        return False


class SnapshotBreakpoint(gdb.Breakpoint):
    def __init__(self):
        super().__init__("cpp_streamer::WebRtcServer::OnTimer", internal=True)
        self.silent = True

    def stop(self):
        global sample_index
        sample_index += 1
        # These are reads of GCC 13/libstdc++ Debug fields, not inferior calls.
        # TimerInner removes the currently executing server timer before OnTimer.
        # Compare samples at this same boundary; this is not the UV handle count.
        metrics = {
            "schema": 1,
            "sample": sample_index,
            "wallTimeMs": time.time_ns() // 1000000,
            "monotonicMs": (time.monotonic_ns() - started_ns) // 1000000,
            "pid": gdb.selected_inferior().pid,
            "usernameSessions": read_count(
                "cpp_streamer::WebRtcServer::username2sessions_._M_h._M_element_count"
            ),
            "addressSessions": read_count(
                "cpp_streamer::WebRtcServer::addr2sessions_._M_h._M_element_count"
            ),
            "liveSessions": len(live_objects["WebRtcSession"]),
            "registeredTimers": read_count(
                "cpp_streamer::TimerInner::instance_->timers_._M_t._M_impl._M_node_count"
            ),
            "timerCurrentServerExcluded": True,
            "stunCalls": stun_calls,
            "liveObjects": {name: len(addresses) for name, addresses in live_objects.items()},
            "constructed": dict(constructed),
            "destroyed": dict(destroyed),
            "probeErrors": list(probe_errors),
        }
        gdb.write("WI003_METRICS " + json.dumps(metrics, sort_keys=True) + "\n")
        return False


for resource in resource_types:
    observer_breakpoints.append(LifetimeBreakpoint(resource, True))
    observer_breakpoints.append(LifetimeBreakpoint(resource, False))
observer_breakpoints.append(StunBreakpoint())
observer_breakpoints.append(SnapshotBreakpoint())
gdb.write("WI003_OBSERVER_READY " + json.dumps({
    "schema": 1,
    "resources": resource_types,
    "boundary": "WebRtcServer::OnTimer entry; executing server timer excluded",
}) + "\n")
end

run
