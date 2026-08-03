# Pre-STUN Lifetime Regression (WI-003)

This fixture exercises the existing SFU, not a meeting product. Prerequisites are
the pinned client/Playwright setup in [README](README.md), Node 22, Chrome, GDB 15
with Python, and a GCC/libstdc++ Debug build. Keep ports 18080 and 18000 free;
start only the Vite fixture on 18081. The runner owns its GDB/SFU child process.

## Build and Run

From the repository root, use fresh output directories where necessary:

```bash
cmake -S third_party/RTCPilot -B build/wi003-debug -DCMAKE_BUILD_TYPE=Debug
cmake --build build/wi003-debug --parallel 4
timeout --kill-after=5s 30s build/wi003-debug/webrtc_session_expiry_test
node scripts/baseline/prepare-config.mjs build/wi003/run
node scripts/baseline/serve.mjs
```

Run the following in a second terminal. If the generated config already exists,
reuse it rather than rerunning the generator. The default evidence directory is
unique; an explicit `WI003_OUTPUT` must not already exist.

```bash
WI003_BINARY=build/wi003-debug/RTCPilot WI003_FULL=1 \
  timeout --signal=TERM --kill-after=10s 270s node scripts/baseline/run-pre-stun.mjs
```

The full run takes about 195 seconds. Omitting `WI003_FULL=1` runs only the
roughly 40-second no-first-STUN regression. `WI003_CONFIG` overrides the config;
`WI002_CHROME` selects Chrome. Production expiry remains 35 seconds. The page
completes real join/push requests, withholds the SDP answer from Chrome to avoid
STUN, and keeps signaling heartbeats alive to isolate transport expiry.

The full run additionally sends real late STUN after reclamation, repeats two
simultaneous no-STUN publications, connects a publication after 27 seconds,
proves active RTP growth across another 39 seconds, then closes it and checks
reclamation. Each publication owns cloned tracks so closing one cannot stop the
source of later cases. This is synthetic audio on loopback, not physical-device
or three-computer acceptance.

## Evidence and Limits

`result.json` contains assertions, browser state, cleanup and periodic snapshots;
`observer.log` contains the debugger output. The GDB script reads both registries
and the timer container without inferior function calls. Constructor/destructor
breakpoints track live session, pusher/puller, receive RTP, DTLS, SRTP and ICE
objects by identity, deduplicating compiler destructor variants. `probeErrors`
must be empty. This is debugger/test instrumentation, not a production endpoint.

Timer counts are measured on entry to `WebRtcServer::OnTimer`, after the timer
queue has removed the executing server timer. Compare identical sampling
boundaries; this is not a count of libuv handles. The joined-room baseline keeps
room/signaling resources alive. GDB field paths are specific to the tested GCC
13/libstdc++ layout; another toolchain may require fixture changes.

The standalone C++ target uses real session/pusher objects, weak references,
registry sizes, close callbacks and registered timers. A private friend peer
ages only fixture sessions; it does not replace the global clock or change the
production timeout. Test teardown drains its libuv loop and checks closure.
CTest registration remains a separate existing gap; invoke tests directly.

## Sanitizers

```bash
cmake -S third_party/RTCPilot -B build/wi003-sanitize -DCMAKE_BUILD_TYPE=Debug \
  '-DCMAKE_CXX_FLAGS=-fsanitize=address,undefined -fno-omit-frame-pointer' \
  '-DCMAKE_EXE_LINKER_FLAGS=-fsanitize=address,undefined'
cmake --build build/wi003-sanitize --target webrtc_session_expiry_test --parallel 4
ASAN_OPTIONS=detect_leaks=1:halt_on_error=1 \
UBSAN_OPTIONS=halt_on_error=1:print_stacktrace=1 \
  timeout --kill-after=5s 30s build/wi003-sanitize/webrtc_session_expiry_test
```

This validates the exercised lifecycle paths, not a general audit of external
libraries or graceful process shutdown. Preserve old evidence and rerun the
existing two/three-browser fixture after changing transport ownership.
