# WI-003: Pre-STUN Session Expiry

English | [中文](2026-09-26-pre-stun-expiry.zh.md)

- Date: 2026-09-26; execution report, not product acceptance.
- Authorization: diagnosis, regression tests, minimal C++ repair and necessary fixtures, recorded in [ACTIVE](../../ACTIVE.md).
- Base HEAD: `eb9e05b7973d5b703687d95cae50e9da7c7b2b5e`; existing dirty/untracked work preserved. No commit or push.
- Previous evidence: [WI-002](2026-09-26-meeting-baseline.md), including its 25-created/22-destroyed audit, remains unchanged. That audit alone did not prove a leak.
- Scope: the existing single-loop SFU's inactivity expiry. No product, ASR, paid API, integration-policy or graceful-shutdown change; no gate is closed.

## Result

The original code reproducibly retained a registered session that had never
received STUN beyond its 35-second deadline. The repaired code releases both
indexes, the session and its media resources, and their timers. Active media and
the existing browser interoperability scenarios continue to work.

| Check | Result | Evidence |
|---|---|---|
| Original real-signaling reproduction, twice | Expected failure | After about 40 seconds, username index=1, address index=0, live session=1 and registered timers=7 instead of baseline 5; STUN count=0. |
| Minimized real-object C++ regression | Red then green | Original server object exits 1: `expired transport is still owned`; repaired object exits 0. Explicit `IsAlive()` checks reject the clock-refresh hypothesis. |
| Fresh Debug build | Pass | `build/wi003-debug`; original WI-002 build preserved. |
| No-first-STUN expiry | Pass | Username/address indexes 0, all tracked media objects 0, registered timers back to 5. |
| Late STUN after reclamation | Pass | 15 observed STUN handler calls at the sampled boundary; no re-registration, object creation or media connection. |
| Repeated expiry | Pass | Two further real publications return timers 9 -> 5; C++ regression additionally checks 20 cycles. |
| First STUN before expiry and active renewal | Pass | Applied answer after 27 seconds; connected, retained after another 39 seconds with 2,006 outbound audio packets. Closing then waiting returned all resources to baseline. |
| Mixed active/expired sessions and address aliases | Pass | Real-object C++ test preserves the live transport/track/timers, removes both expired address aliases, verifies weak-reference expiration and exactly one close callback. |
| Three existing tests | Pass | `rtcp_tcc_fb_test`, `timer_test`, `ws_protoo_client_test`, each directly run with a 30-second timeout, exit 0. |
| Targeted ASan/UBSan, leak detection enabled | Pass | Instrumented real-object regression exits 0; no sanitizer diagnostics. |
| WI-002 browser regressions | Pass | Two/three Chrome instances, signaling-only reconnect, others continuing after exit, same-ID rejoin and subsequent notifications; 47.343-second soak crosses the default timeout. |
| Repository checks and final process cleanup | See completion record | Recorded below after final checks. |

## Diagnosis

Real protoo `join` and `push` requests create a session in `username2sessions_`.
The fixture holds the returned SDP answer without applying it to Chrome, so the
browser does not send its first STUN. Its signaling heartbeat remains active to
isolate transport expiry from room/user expiry.

The old `WebRtcServer::OnTimer` scanned only `addr2sessions_`, which receives an
entry only when STUN arrives. The username-only session therefore never reached
the `IsAlive()` check. The retained shared pointer kept its pusher, receive RTP,
DTLS and ICE objects, and two timer registrations alive.

Before changing production code, the failure snapshots and three falsifiable
hypotheses were saved in `build/wi003/evidence/diagnosis-before-fix.md`:

1. Incomplete expiry coverage: confirmed by both real signaling and the minimized test.
2. Unexpected activity refresh or clock behavior: the controlled-age test proves `IsAlive()==false` while old code still retains the object. Production time remains unchanged.
3. Ownership outside the registries: after repairing index removal, weak references expire and directly observed objects/timers return to baseline. No additional retaining owner was found in these exercised paths.

This establishes a specific retention defect. It does not retrospectively prove
that each unmatched object in the original WI-002 audit had this exact cause,
or certify the entire SFU free of leaks.

## Change Boundary

- `webrtc_server.cpp`: derive expired objects from the username registry; remove every matching address alias and username entry by object identity. Retain expired objects locally until both indexes are clean, then allow existing destructor/close callbacks to run.
- `webrtc_server.hpp`, `webrtc_session.hpp`, `timer.hpp`: one private test-peer friend declaration each. No network diagnostic endpoint or new public clock/ownership API.
- `tests/webrtc_session_expiry_test.cpp` and one CMake target: reuse real SFU sources and dependencies. Local fixture timestamps, weak references, close callbacks, index/timer assertions, and checked libuv teardown. No CTest-system overhaul.
- `scripts/baseline/pre-stun*` and `run-pre-stun.mjs`: actual browser signaling plus GDB observation. Each publication owns cloned audio tracks; driver failures preserve evidence and terminate owned processes.
- Documentation: this paired report, reproduction instructions, ACTIVE and PRD traceability. WI-002 same-ID repair, existing evidence and upstream attribution remain intact.

`WebRtcSession::IsAlive()` still uses **35,000 ms**. Room removal, full graceful
shutdown and other ownership boundaries were not refactored. In particular,
`RemoveSessionByRoomId` retains its existing address-based implementation; this
report does not claim independent coverage of that API.

## Reproduction and Evidence

Follow [PRE-STUN.md](../../scripts/baseline/PRE-STUN.md) for build, fixture,
timeouts and sanitizer commands. The browser prerequisite and source pin remain
in the [baseline README](../../scripts/baseline/README.md): upstream client
`e08c241f2f80518ebe1138d2127215bb11a52a61`, Playwright Core 1.62.1, Chrome for
Testing 151.0.7922.34. Host: Ubuntu 24.04 x86_64, GCC 13.3, CMake 3.28.3, GDB
15.1 and Node 22.22.3. The independent config disables VoiceAgent and unrelated
listeners; signaling/media stay on loopback ports 18080/18000.

All local evidence is under `build/wi003/evidence/`:

| Path | Contents |
|---|---|
| `pre-stun/result.json`, `pre-stun-red-repeat/result.json` | Two original-binary failures, browser state and direct GDB observations. |
| `pre-stun-green/result.json` | Full repaired real-signaling run, four phases, all object/index/timer samples and client cleanup. |
| `deterministic-test-commands.json`, `deterministic-{red,green}.log` | Exact compile/link commands using unchanged baseline objects plus separate original/repaired server objects; failure then success. |
| `expiry-debug-final.log`, `expiry-sanitize-final.log` | Final standalone regression and sanitizer execution. |
| `debug-*.log`, `sanitize-*.log`, `*-test-build*.log` | Isolated configure/build history, including intermediate failures. |
| `rtcp_tcc_fb_test.log`, `timer_test.log`, `ws_protoo_client_test.log`, `ctest-discovery.log` | Existing direct tests and separate discovery result. |
| `wi002-regression/result.json` | Media statistics, remote decoded PCM, changing video, screenshots, all regression phases and cleanup. |
| `production-expiry.patch`, `binaries-source.sha256` | Bounded production change and binary/source identities. |

GDB reads registry/container sizes and tracks live object identities at actual
constructor/destructor breakpoints; duplicate compiler destructor variants are
deduplicated. It makes no inferior function calls. `probeErrors` is empty. Timer
samples exclude the currently executing server timer, so comparison is always
at the same callback boundary. These counts are not libuv handle counts or RSS.

The C++ test independently verifies destruction with weak references and checks
its own libuv loop closes. ASan/UBSan instrument project code on the exercised
paths; this does not claim full instrumentation of external dependencies or a
whole-server shutdown/leak audit. The browser regression requires remote PCM of
the correct tone, changing video pixels/decoded frames and increasing received
audio/video bytes in every direction. It is not human listening or real hardware.

## Failures, Limits and Completion

- Expected pre-fix failures are retained, not overwritten by green results.
- The first new Debug source build failed because the added `unordered_set` include was missing; the include was corrected and final build passed. One test-target invocation preceded CMake regeneration and was rerun successfully. These are resolved execution issues, not remaining failures.
- Existing issues remain: CTest discovers **0 tests**; the pinned upstream browser's production build has the 11 previously recorded TypeScript errors; the known unrelated skill-document link failure is not repaired here.
- Not verified: three physical computers, LAN HTTPS/WSS and trusted certificates, real microphones/cameras/loudspeakers, weak-network behavior, broad shutdown safety, meeting admission/captions/ASR. No architectural gate is closed.
- Completion checks: `npm test` passes 5/5; `npm run check:deps` and `git diff --check` pass. `npm run docs:verify` has 0 structure errors and exactly one existing link error: `.agents/skills/setup-ts-deep-modules/SKILL.md` points to missing `./src/packages/README.md`. The unrelated skill remains unchanged.
- Final runner check passes in `pre-stun-final/result.json`. An interruption test first exposed Playwright's competing SIGTERM handler; the fixture now owns signal cleanup explicitly. `driver-sigterm-fixed/result.json` records expected cancellation (outer timeout exit 124), no cleanup errors, closed peer/audio resources and no forced server kill. The canceled run is not counted as a completed behavioral pass.
- Owned Chrome, GDB, SFU and Vite processes stopped; ports 18000, 18080, 18081 and 9002 have no listeners. Empty `final-owned-processes.txt` and `final-listening-ports.txt` record the check. SIGTERM/process release does not certify graceful application shutdown.
- Documentation/check logs are `check-test.log`, `check-check-deps.log`, `check-docs-verify.log` and `git-diff-check.log` under the evidence directory.

## Next Smallest Task

Establish **LAN HTTPS/WSS access using the existing fixture**, first from another
physical computer and then for the planned three-computer acceptance. It depends
on this repaired Debug/media baseline, a reachable LAN candidate, trusted browser
secure contexts and available devices. Reuse the pinned client and disabled-ASR
configuration; do not start the full meeting UI or caption work. Keep the existing
upstream build, CTest and other gate gaps separately tracked.
