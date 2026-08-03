# WI-002 Build and Browser Media Baseline

English | [中文](2026-09-26-meeting-baseline.zh.md)

- Type: Execution report
- Status: Executed - baseline passed with explicit gaps
- Date: 2026-09-26 (UTC)
- Decision: spike-only; no gate closed
- Authorization: maintainer approved the [baseline plan](../plans/meeting-baseline-spike.md), execution and small necessary build, compatibility and fixture repairs; recorded in [ACTIVE](../../ACTIVE.md).
- Scope: Debug build, direct existing tests, isolated browser media and cleanup. No paid API, ASR, product implementation, commit or push.

## Results

| Check | Result | Evidence |
|-------|--------|----------|
| Fresh RTCPilot Debug configure/build | Pass | New `build/rtcpilot-meeting-baseline`; original SFU built successfully, repaired SFU rebuilt successfully. |
| Three existing executables | Pass | TCC, timer and protoo each exit 0 under a 30-second timeout, before and after repair. |
| CTest discovery | Gap | `Total Tests: 0`; an empty suite is not a passing test run. |
| Pinned upstream browser example | Partial | Original Vite UI loads HTTP 200 without page errors; production build fails with 11 TypeScript diagnostics. |
| Two independent Chrome processes | Pass | Both remote directions: decoded audio, changing rendered video and increasing media counters. |
| Three independent Chrome processes | Pass | All six remote directions have audio and video. |
| Same-ID immediate media rejoin | Initially failed; repaired | Server advertised old and new publications together. The established two-browser reproduction passes after repair. |
| Signaling-only reconnect and later notifications | Pass | Media continues; rejoined Charlie receives Bob's later fresh publication. |
| Ten-minute three-browser observation | Pass | 602.362 seconds, 19 periodic samples; all six remote directions passed. |
| Final resource cleanup and port release | Pass for the successful runs; negative-path gap | All 26 successful-run transports and both rooms destroyed; browsers and ports released. Earlier failed runs have three unmatched destruction records. |
| Three physical computers, real devices and trusted LAN HTTPS/WSS | Not verified | Local synthetic media does not establish real-device or real-network acceptance. |

## Sources and environment

- Repository HEAD: `eb9e05b7973d5b703687d95cae50e9da7c7b2b5e`. Existing modified/untracked documentation and vendored source were preserved.
- RTCPilot import: `b0fb2c4f24cea5e4f5c4b3f84c342857bc7645d8`, per [upstream record](../../third_party/RTCPilot/UPSTREAM.md). Attribution and LICENSE retained.
- Browser: [runner365/webrtc_js_client at e08c241f2f80518ebe1138d2127215bb11a52a61](https://github.com/runner365/webrtc_js_client/tree/e08c241f2f80518ebe1138d2127215bb11a52a61), detached unchanged MIT checkout in ignored `build/wi002-browser/upstream`.
- Ubuntu 24.04 x86_64; CMake 3.28.3; GCC 13.3.0; Node 22.22.3; zlib 1.3; bzip2 development files present.
- OpenSSL 3.5.4, libuv 1.44.3, yaml-cpp 0.8.0, libsrtp `2.5.0-pre` (installed pkg-config version).
- Google Chrome for Testing 151.0.7922.34, Playwright Core 1.62.1, Vite 7.1.12. Separate Chrome processes, sandbox enabled, no disabled certificate checks or web security. Headless defaults mute system audio; PCM decoding and playback state are measured separately from physical audibility.

| Input | SHA-256 |
|-------|---------|
| `openssl-3.5.4.tar.gz` | `967311f84955316969bdb1d8d4b983718ef42338639c621ec4c34fddef355e99` |
| `libsrtp.tar.gz` | `12c27353a636d9ab84ee0c63395ad536a3326d89fec614dcb5511ff22d491305` |
| Browser `package-lock.json` | `1d0b68d0c1d664ec4b305827962835f9c351f6f2629ecdb141db1e1aa48f8bf5` |
| Browser MIT `LICENSE` | `06dcddbb6908a0c6dd4a9e8ec822eea41d5a460a53089fecccc8a68049e99241` |

Existing CMake policy/deprecation, compiler signedness and OpenSSL Perl warnings did not fail the build. SFU text logs print a month one lower than UTC; external UTC and event JSON timestamps govern this report. That unrelated logging defect was not edited.

## Reproduce

Run the exact Debug configure/build and three direct timeout commands in the [approved plan](../plans/meeting-baseline-spike.md). Choose a fresh directory rather than deleting an existing build. Debug retains assertions; test port 9002 must be free. Build the SFU before the tests to make dependencies available.

The [browser fixture instructions](../../scripts/baseline/README.md) pin checkout/dependencies and give both the original example startup and the experimental runner. Generate independent configuration and start services in separate terminals:

```bash
node scripts/baseline/prepare-config.mjs build/rtcpilot-meeting-baseline/run
build/rtcpilot-meeting-baseline/RTCPilot build/rtcpilot-meeting-baseline/run/config.json
node scripts/baseline/serve.mjs
WI002_SOAK_SECONDS=600 timeout --kill-after=10s 900s node scripts/baseline/run-browser.mjs
```

The generator refuses to overwrite configuration. It binds signaling to `127.0.0.1:18080` and the sole UDP candidate to `127.0.0.1:18000`, with zero injected loss. RTMP, HTTP-FLV, WS-FLV, WHIP, cluster, VoiceAgent and TTS are disabled; no recognizer is started. Absolute certificate/key paths reference existing test fixtures for DTLS, without publishing key contents. The actual initial run used equivalent `run/config.yaml`.

The actual browser run selected cached Chrome with `WI002_CHROME` and saved to `WI002_OUTPUT=build/wi002-browser/evidence/three-browser-soak`. The fixture imports upstream `PCWrap` and `ProtooClientWrap`, uses `/webrtc` and `protoo`, and sends all media through the SFU. It is not a product framework selection or UI implementation.

## Media and repair evidence

The observation ran from 13:53:16.357 to 14:03:18.719 UTC (602.362 seconds).
All 19 periodic samples passed across six remote directions; all 25 scenario/sample
checks passed. Negotiated codecs were Opus/48 kHz and H.264/90 kHz; final ICE and
DTLS were connected. Final cumulative counters for each current receiving connection:

| Receiver <- sender | Audio bytes | Video bytes | Decoded video frames | Measured tone (Hz) |
|--------------------|------------:|------------:|---------------------:|-------------------:|
| Alice <- Bob | 387563 | 23508573 | 5591 | 662.11 |
| Alice <- Charlie | 487294 | 25093564 | 5574 | 878.91 |
| Bob <- Alice | 374173 | 23877892 | 5614 | 439.45 |
| Bob <- Charlie | 484449 | 25047445 | 5551 | 878.91 |
| Charlie <- Alice | 376422 | 24004331 | 5646 | 439.45 |
| Charlie <- Bob | 387603 | 23508573 | 5591 | 662.11 |

Final remote PCM RMS ranged from 0.08060 to 0.08500. All twelve inbound media
reports recorded zero packets lost. These are loopback results with synthetic
input, not weak-network measurements or latency/service targets.


Alice/Bob/Charlie publish synthetic 440/660/880 Hz audio and animated 640x360 canvas tracks at 10 fps. Every receiver samples its remote decoded PCM: RMS must exceed 0.005 and peak frequency must be within 20 Hz of the remote sender. Remote video pixel hashes, rendered/decoded frames and received audio/video bytes must change or increase across samples; DTLS must be connected. Local preview cannot satisfy these assertions. Physical speaker output and human listening are not established by headless automation.

Initial two/three-browser media and A/B continuity after C left passed. C's immediate rejoin failed with an audio demultiplexing SDP error. An established two-browser reduction failed with `bob advertised audio,audio,video,video`; server events included the exact two old IDs and two new IDs. This rules out a purely client-side duplicate subscription. An earlier reduction without established media passed and is retained as timing evidence, not a failing reproduction.

Following `diagnosing-bugs`, the repair touches only [room.cpp](../../third_party/RTCPilot/src/webrtc_room/room.cpp) and [rtc_user.hpp](../../third_party/RTCPilot/src/webrtc_room/rtc_user.hpp). Reconnect rebinds the response callback and refreshes activity. Only its first successful subsequent push removes the previous publications and their routes. Signaling-only reconnection preserves media, receiving subscriptions remain intact, and old transports retain existing expiry. Wire names, WHIP and the external VoiceAgent strategy are unchanged.

Regression checks cover the original failure, signaling-only continuity, later notification delivery to a rejoined user, and media beyond old-transport expiry. General failed-publish rollback, simultaneous identity takeover, authorization and graceful shutdown remain outside this repair.

The upstream production-build failure was separately narrowed to `PCWrap.setRemoteDescription` declaring but not returning a Promise, alongside Vue typing errors. The fixture awaits the native Promise and uses Vite development transpilation. The original upstream source remains unchanged; its production build is still failed.

## Retained artifacts

- `build/rtcpilot-meeting-baseline/evidence/`: preflight/dirty-tree snapshot, configure/build logs, individual initial/final test logs, CTest discovery, before-source copies, repair patches and resource samples.
- `build/rtcpilot-meeting-baseline/run/`: independent config and structured/text logs. Raw local diagnostics contain ephemeral test SDP; they are not product artifacts or credential publication.
- `build/wi002-browser/evidence/`: upstream build failure/UI screenshot, initial failure, reduced reproduction, repaired regression and full three-browser screenshots/statistics.
- [Durable fixture](../../scripts/baseline/README.md): setup and executable verification; downloaded client and generated binaries remain ignored.

## Cleanup and checks

All three browser processes exited after the full run. Each peer connection was
closed, each local track ended, each AudioContext closed and each remote collection
emptied. SFU transport destruction completed around 14:03:54 UTC, user release at
14:04:24, and empty-room destruction at 14:05:54.694. Both repaired-run rooms were
removed; all 26 constructed transports had matching destruction records (7 in the
minimal regression and 19 in the full run). The existing activity/empty-room timers
are not the product's proposed 60-second meeting-end rule.

The SFU had 14 descriptors at startup, 19 during three-party media, and 16 after
expiry, including the two lazily opened event logs. Stable observed RSS was
33316 KiB during the later soak and 33204 KiB after expiry; allocator retention
means this is not a leak-free claim. Samples and descriptor targets are retained.

A separate two-browser stop test recorded Alice receiving Bob's actual remote
audio track to `build/wi002-browser/evidence/server-stop/alice-receives-bob.wav`:
96000 samples, mono 48 kHz, 2 seconds, PCM16, RMS 0.079944 and measured 660 Hz.
AudioWorklet collected the received track; the tone was not reconstructed from a
frequency value. SHA-256: `d84a0207d9be7eadf5f9a37430dcb5fa0065a49b63b7cc877edd9fdf1b602209`.

SIGTERM at 14:08:09 stopped the owned SFU with exit 143. Both browsers observed
signaling disconnection and completed local cleanup. The fixture server stopped;
TCP 18080/18081/18082/9002 and UDP 18000 were free. A final generated-config startup
succeeded and was intentionally stopped by a three-second timeout (exit 124).
There is no installed graceful signal-drain handler: OS termination and port
release do not establish ordered application shutdown.

The earlier negative experiments have a separate cleanup gap: 25 transports were
constructed but only 22 had destruction records even after all three rooms were
destroyed. `initial-cleanup-audit.json` lists the three unmatched IDs. Combined
with the address-only expiry scan in `webrtc_server.cpp`, this motivates a pre-STUN
expiry regression. Logs alone are not a sanitizer or live-registry leak proof.

| Check | Final result |
|-------|--------------|
| `npm test` | Pass, 5/5 documentation tests |
| `npm run check:deps` | Pass |
| `git diff --check` and fixture syntax checks | Pass |
| `npm run docs:verify` | Failed: existing `.agents/skills/setup-ts-deep-modules/SKILL.md` link to `./src/packages/README.md` |

The first post-build docs check also produced 12 errors inside extracted OpenSSL
build output. A one-line scanner configuration change excludes generated `build`
directories, consistent with existing dependency exclusions. The known skill link
was neither changed nor hidden. Documentation structure passes; the full command
remains failed. No unrelated skills were edited.

## Next smallest task

Add a bounded regression for a negotiated transport that never sends its first
STUN packet, measure registry/handle counts after expiry, and repair that specific
cleanup path. Its evidence dependencies are the saved 25/22 negative-run audit,
`WebRtcServer::OnTimer` traversing `addr2sessions_`, the current 35-second transport
expiry, and this passing connected-media fixture as the control. Do not begin
caption or product work on an assumed lifecycle guarantee. CTest registration is
still a separate build-gate requirement; three real computers and trusted LAN
capture remain the subsequent acceptance boundary.

Governance: source/protocol compatibility is demonstrated for this pinned local
fixture; resource ownership/cancellation and complete shutdown remain gaps;
product UI and persistence changes are N/A. No architecture gate or PRD acceptance
status is promoted by this spike.

