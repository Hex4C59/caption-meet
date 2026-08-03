# Meeting Baseline Spike

English | [中文](meeting-baseline-spike.zh.md)

- Type: Plan
- Status: Executed - results and remaining gaps recorded
- Created: 2026-09-26
- Work item: WI-002
- Decision: spike-only
- Gates: `gate-sfu-build`, `gate-rtc-signaling`
- Authority: Maintainer approved execution and small necessary baseline repairs on 2026-09-26
- Related: [Confirmed scope](../discussions/2026-09-26-meeting-scope.md), [Active work](../../ACTIVE.md), [Gates](../reference/architecture-gates.md)

Execution evidence: [WI-002 report](../reports/2026-09-26-meeting-baseline.md).

## Objective and scope

Establish a reproducible build of the in-tree C++ SFU, run its existing tests,
and demonstrate two-way audio and camera video with two, then three Chrome
clients. A suggested timebox is one 10-hour learning week, not a delivery guarantee.
Execution is approved, including small necessary build, compatibility and fixture
repairs. Actual results are recorded separately; approval is not evidence of success.
ASR and VoiceAgent stay disabled throughout the spike. Paid API activation and
full product implementation remain outside this work item.

The three-person hard limit, meeting links, 60-second empty-room expiry, captions,
and full product UI are later implementation requirements. Their absence does not
fail this baseline; passing this baseline does not demonstrate those requirements.

## Repository evidence

- [Build configuration](../../third_party/RTCPilot/CMakeLists.txt) uses C++17 at line 5, defines `RTCPilot` at line 63 and three test targets at lines 270, 273 and 302. Linux links zlib and bzip2 at line 249.
- [Dependency configuration](../../third_party/RTCPilot/3rdparty/CMakeLists.txt) builds bundled libuv/yaml-cpp at lines 7-8 and local OpenSSL/libsrtp archives at lines 40-74. Nested builds use `make -j 4`; outer parallelism does not fully cap concurrency.
- Tests use `assert`: [TCC](../../third_party/RTCPilot/tests/rtcp_tcc_fb_test.cpp), [timer](../../third_party/RTCPilot/tests/timer_test.cpp), [protoo](../../third_party/RTCPilot/tests/ws_protoo_client_test.cpp). Use Debug so checks and operations inside assertions are retained. The root CMake does not register these tests with CTest.
- The protoo test binds `127.0.0.1:9002`, reads the bundled test certificate/key, and has no internal deadline (its source lines 119-140). The external timeout below is required.
- [Browser client](../../apps/web/README.md) is a placeholder. The [SFU README](../../third_party/RTCPilot/README.md) only points to the external `runner365/webrtc_js_client` demo at line 24; no compatible client build has been verified here.

## Preflight

Run from the repository root after execution is authorized. Record output and
exit codes; do not install missing tools or kill processes holding ports silently.
Confirm zlib/bzip2 development libraries are present. Use a new build directory;
if the proposed directory exists, select another path instead of deleting it.

```bash
git status --short
git rev-parse HEAD
command -v cmake c++ make perl pkg-config node npm
cmake --version
c++ --version
npm run check:deps
sha256sum third_party/RTCPilot/3rdparty/openssl-3.5.4.tar.gz third_party/RTCPilot/3rdparty/libsrtp.tar.gz
ss -lntup
```

## Build and existing tests

Build the SFU first to ensure its dependencies exist before building the tests.
Run each test separately; a timeout, crash or assertion failure is a failed test.
CTest discovery records the registration gap and is not a substitute for execution.

```bash
cmake -S third_party/RTCPilot -B build/rtcpilot-meeting-baseline -DCMAKE_BUILD_TYPE=Debug
cmake --build build/rtcpilot-meeting-baseline --target RTCPilot --parallel 2
cmake --build build/rtcpilot-meeting-baseline --target rtcp_tcc_fb_test timer_test ws_protoo_client_test --parallel 2
timeout --kill-after=5s 30s build/rtcpilot-meeting-baseline/rtcp_tcc_fb_test
timeout --kill-after=5s 30s build/rtcpilot-meeting-baseline/timer_test
timeout --kill-after=5s 30s build/rtcpilot-meeting-baseline/ws_protoo_client_test
ctest --test-dir build/rtcpilot-meeting-baseline -N
```

Passing these tests covers only their existing assertions, not lifecycle safety,
media capacity or browser interoperability. Registering reliable tests remains a
separate build-gate requirement; an empty CTest suite is not a successful test run.

## Browser fixture and local configuration

1. Acquire and inspect a fixed revision of the upstream demo, including its license, dependencies and actual startup commands. Record the revision. Treat it as an isolated test fixture, not a product framework choice. Production builds must not depend on undeclared external checkout paths. If no compatible demo is available, stop and scope a minimal protocol probe separately.
2. Prepare an uncommitted configuration under `build/rtcpilot-meeting-baseline/run/`. Starting from the [sample configuration](../../third_party/RTCPilot/RTCPilot/config.yaml), replace the hard-coded candidate address with the experiment host's reachable address. Keep one UDP candidate, zero injected packet loss, and disable RTMP, HTTP-FLV, WS-FLV, WHIP, cluster and VoiceAgent services. Bind only the intended local experiment interface.
3. Use absolute certificate/key and log paths. DTLS initialization requires top-level certificate/key paths even with plain WebSocket signaling ([entry point](../../third_party/RTCPilot/src/RTCPilot.cpp), line 85). Bundled credentials are test fixtures, not final LAN deployment credentials. Verify browser capture availability in a secure context; real LAN validation needs a trusted HTTPS/WSS setup, not disabled browser security.
4. Configure the fixture for `/webrtc` with the `protoo` subprotocol ([signaling server](../../third_party/RTCPilot/src/ws_message/ws_message_server.cpp), lines 17-37). It must support `join`, audio/video `push`, `pull` by publication ID, membership/publication notifications and heartbeats; use [wire examples](../../third_party/RTCPilot/ws_design.md) and [heartbeat handling](../../third_party/RTCPilot/src/webrtc_room/room_mgr.cpp), line 353.

Only after these assets are ready, start the SFU with the prepared configuration;
the [entry point](../../third_party/RTCPilot/src/RTCPilot.cpp), line 48, accepts its path.
The browser startup command must come from the inspected fixture, not an assumed stack.

```bash
build/rtcpilot-meeting-baseline/RTCPilot build/rtcpilot-meeting-baseline/run/config.yaml
```

## Interoperability procedure

1. Join the same room from two isolated desktop Chrome instances with distinct participant IDs. Publish audio and camera video and subscribe in both directions.
2. Verify changing remote pictures and distinguishable remote test speech, not just local previews. Record negotiated audio/video codecs, ICE/DTLS state, and increasing received bytes/decoded frames for each remote publication.
3. Add a third client; each receives the other two participants' audio and video. Have the third leave and rejoin while the first two continue. Observe for a suggested ten minutes; this is a spike window, not a final stability target.
4. Multiple local instances may use distinct synthetic media fixtures to avoid device contention. Use headphones for human listening checks. Final acceptance on three physical LAN computers is separate and must not be claimed from multiple local tabs.
5. Stop clients and the experiment server; confirm associated ports are released. Record failures and shutdown results without claiming memory safety from one successful run.

## Evidence, stop conditions and gates

Retain the source revision and dirty-tree summary, tool versions, dependency hashes,
commands and exit codes, sanitized configuration, client revision/startup command,
Chrome version, redacted SDP/statistics summaries and a two/three-client result matrix.
Do not retain private keys or real meeting recordings in the report.

Stop at missing prerequisites, build/test failure, unavailable or incompatible client,
occupied required ports, missing browser trust/capture setup, or any failed direction
of audio or video. Preserve a minimal reproduction and propose a focused repair;
do not stack caption work on a failing baseline. At the timebox, report partial
evidence and unresolved questions instead of treating elapsed time as completion.

Build reproducibility and signaling remain gaps until this procedure is executed.
No gate closes merely because this plan exists or a call succeeds: CTest registration,
reviewed evidence and the [gate closure process](../reference/architecture-gates.md)
still apply. Admission, lifecycle, capacity and caption integration are not certified
by this baseline. No framework, integration-policy change or new Accepted ADR is selected.
