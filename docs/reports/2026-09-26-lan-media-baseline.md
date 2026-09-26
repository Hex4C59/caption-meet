# LAN HTTPS/WSS and Media Baseline (WI-004)

English | [中文](2026-09-26-lan-media-baseline.zh.md)

- Type: Execution report
- Status: Automated baseline executed; physical-device acceptance pending
- Date: 2026-09-26
- Authority: Observed fixture evidence, not product acceptance or gate closure
- Related: [WI-002](2026-09-26-meeting-baseline.md), [WI-003](2026-09-26-pre-stun-expiry.md), [commands](../../scripts/baseline/LAN.md), [ACTIVE](../../ACTIVE.md)

## Outcome and Authorization

The approved LAN configuration, HTTPS/WSS serving, isolated browser trust and
native camera/microphone fixture are runnable. Automatic checks passed with
the existing SFU. The maintainer explicitly reported that the other physical
computers were unavailable. Two-computer media, three-computer ten-minute media,
actual microphone/camera behavior and human listening remain **unverified**.
WI-004 stays Build, WIP=1; none of its gates is closed.

Scope followed the explicit authorization for configuration, development TLS,
fixture changes and bounded compatibility/regression work. No C++ change was
needed in WI-004. The default transport timeout remains 35 seconds. There was
no paid API, VoiceAgent/ASR activation, admission/product UI implementation,
global trust/firewall/router change, commit or push. Earlier changes and
WI-002/WI-003 evidence were preserved.

## Implementation and Trust Boundary

- `prepare-config.mjs` retains its original loopback CLI and defaults. Its
  shared generator accepts listen/candidate addresses, ports and nested WSS
  certificate paths; existing output cannot be overwritten.
- `prepare-lan.mjs` requires an assigned private IPv4 and a new run directory.
  It generates a seven-day CA/server certificate with the exact IP SAN, then
  writes separate configuration and a URL/certificate manifest.
- `serve-lan.mjs` serves only in-memory Vite build outputs over Node HTTPS,
  without filesystem mapping or Vite development endpoints. Private keys have
  mode 0600 inside a 0700 directory. The LAN configuration disables unrelated
  services and routine event/SDP logs.
- `prepare-browser-trust.mjs` imports only the public CA into a new NSS database
  under ignored `build/`. Chrome receives a per-process `XDG_DATA_HOME` and a
  separate profile. The helper refuses an existing legacy `~/.pki/nssdb` that
  would override this isolation. Existing user/system trust remains unchanged.
- Device mode adds preview, explicit join, leave, retry and same-page rejoin.
  Preview creates no signaling or peer connection. Late capture after
  cancellation is stopped. Permission, absent-device and busy-device errors
  remain recoverable. Synthetic mode retains the original media assertions.
- Device evidence contains bounded statistics, aggregate audio energy and frame
  counters, without recordings, audio samples or video pixels. Stats include
  selected candidate pairs and omit ICE username-fragment fields. The ten-minute
  collector/export supports later human acceptance; no ten-minute physical
  observation was performed here.

These are trusted-LAN test tools. TLS does not supply membership authorization.
The pinned upstream helpers, MIT license and source remain intact under
`build/wi002-browser/upstream`, revision
`e08c241f2f80518ebe1138d2127215bb11a52a61`. Vite bundling this fixture does not
claim that the upstream Vue/TypeScript application type-checks.

## Executed Environment

| Item | Observed value |
|------|----------------|
| Platform | Ubuntu 24.04 x86_64; Node 22.22.3; CMake 3.28.3; GCC 13.3 |
| Browser | Chrome for Testing 151.0.7922.34, Playwright-core 1.62.1; sandbox enabled |
| New Debug build | `build/wi004-debug` |
| LAN run / evidence | `build/wi004/run` / `build/wi004/evidence` |
| Interface | `enp94s0f0`, `10.10.16.135/27` |
| Page | `https://10.10.16.135:19081/browser.html` |
| Signaling | `wss://10.10.16.135:19080/webrtc` |
| Media | `10.10.16.135:19000/UDP`, RTCPilot host candidate |
| Isolated trust | `build/wi004/trust-data/pki/nssdb` |
| Loopback retained | `127.0.0.1`, HTTP 18081 / WS 18080 / UDP 18000 |

The IP belongs to this machine at execution time; another computer's reachability
is not established by same-machine traffic to its LAN address. The manifest has
distinct Alice/Bob/Charlie URLs with `media=devices`, room and WSS endpoint.

Certificate SAN: `IP Address:10.10.16.135`. The leaf is for server authentication
on HTTPS and native SFU WSS, separate from the upstream WebRTC DTLS credentials.
Validity ends on 2026-10-03; exact timestamps are in `run/lan.json`.

```text
CA SHA-256:
5E:3F:D5:A9:6C:45:18:FE:AA:FB:27:64:29:1E:A6:7E:9F:C0:65:04:14:1D:52:53:B7:0F:ED:00:C7:EF:86:5F
Leaf SHA-256:
8B:F0:9C:28:DB:B1:F1:12:27:0F:E2:4C:B0:6E:81:85:6F:CA:4F:D8:86:96:55:5D:94:83:D0:AE:4E:CE:DB:F8
```

Only the public `build/wi004/run/ca.crt` may be transferred for trust setup.
Neither private key belongs in static content, logs or Git. For a changed IP or
expired certificate, generate a new run/trust directory and update the wizard;
do not reuse the old fingerprint. `libnss3-tools` version
`2:3.98-1ubuntu0.2` was extracted locally under `build/wi004/tools`, without a
system package installation.

## Passed Checks

Paths below are relative to `build/wi004/evidence/`.

| Check | Actual result and evidence |
|-------|----------------------------|
| Fresh Debug configure/build | Exit 0, `debug-configure.log`, `debug-build.log` |
| Three original direct tests | `timer_test`, `rtcp_tcc_fb_test`, `ws_protoo_client_test` each exit 0 under 30-second timeout; same-name logs |
| Focused C++ lifetime test | `webrtc_session_expiry_test` exit 0 under 30-second timeout |
| Real-signaling WI-003 regression | All four phases pass in `pre-stun-loopback/result.json`: no-first-STUN expiry, late-STUN rejection, repeated expiry and delayed-first-STUN/active renewal |
| Normal browser certificate validation | Untrusted CA gives `ERR_CERT_AUTHORITY_INVALID`; isolated trust gives HTTPS 200, TLS 1.3, secure context and WSS open/close 1000. `browser-trust/result.json`; existing trust metadata unchanged |
| HTTPS/key/config boundary | Wrong CA/hostname rejected; assets load; private/config/source/Vite paths return 404; POST returns 405. `tls-boundary-final/result.json` |
| LAN synthetic media | Two/three browsers, signaling-only reconnect, continued media after exit, same-ID rejoin and later notifications pass; final soak 47.331 seconds. `lan-media-final/result.json` |
| Retained loopback media | Same media/reconnect phases pass; soak 47.366 seconds. `loopback-media/result.json` |
| Native capture workflow | Nine phases pass with Chrome fake hardware: permission denial/retry, preview isolation, controlled absent/busy errors, cancellation, join/rejoin and mixed-content rejection. `permissions-final/result.json` |
| Native capture transport | Fake hardware through getUserMedia passes two/three-browser media and reconnect cases; soak 12.366 seconds. `lan-fake-devices/result.json`; statistics only, no screenshots/WAV |
| Independent native capture diagnosis | Twelve permission/capture assertions pass on valid loopback and LAN 200 pages. `native-capture-investigation/native-control.json` |
| Responsive synthetic fixture | 375px/1120px layouts have no horizontal overflow; changing remote video and cleanup checked. `viewports/result.json` and synthetic screenshots |
| Human-operation wizard | Template library unchanged, CA/URLs match, four stages and `bash -n` pass. `device-wizard-static-checks.json`; no interactive acceptance performed |

All six receive directions in the final LAN three-browser phase select the SFU
at `10.10.16.135:19000/UDP`. Remote decoded PCM RMS is approximately
0.0810-0.0852; measured tones are 439.45, 662.11 and 878.91 Hz. Every direction
has advancing received audio/video bytes and decoded frames, changing rendered
pixels, and connected transport. This is digital remote media evidence, not
human listening through speakers.

The WI-003 regression directly observes indexes, object identity and timers.
No-STUN expiry returns username/address counts and tracked live transport
objects to zero; registered timers return from 7 to the corresponding joined-room
baseline of 5. Repeated and active-connection cleanup also return to that baseline.
Browser runs record closed peers, ended tracks, closed audio contexts and zero
remote entries. Process/port cleanup is recorded separately; process termination
is not graceful-shutdown acceptance. No C++ lifetime change means no additional
sanitizer run was required; the targeted ASan/UBSan pass remains WI-003 evidence.

## Failures and Unverified Items

The initial permission runner failed because an async predicate was passed to
the pinned Playwright polling implementation, which treated the Promise itself
as success. Bounded Node-side polling now awaits each snapshot. Initial failures
remain in `permissions/` and `permissions-repeat/`; final success is separate.

An early native probe navigated to a nonexistent route and reached a Chrome
error document. Its `NotSupportedError` did not demonstrate a capture failure
on the real HTTPS page. Valid 200-page controls passed without changing TLS or
browser security settings; counterevidence is in `native-capture-investigation/`.

Existing issues remain separate: CTest discovers zero tests
(`ctest-discovery.log`); the pinned upstream TypeScript build previously failed
with 11 errors (WI-002, not rerun or repaired here); the unrelated skill link
`.agents/skills/setup-ts-deep-modules/SKILL.md` to `./src/packages/README.md`
is a known documentation-check failure. No unrelated skill was changed.

Unverified: second/third physical computer reachability and media, real hardware
permission/device variations, human sound and changing-camera confirmation,
three-computer ten-minute stability, weak networks, admission and general
graceful shutdown. Shellcheck was unavailable; the wizard was syntax/structure
checked, not interactively executed.

## Reproduction and Next Task

Use [LAN.md](../../scripts/baseline/LAN.md) for build, certificate generation,
start/stop, trust checks and media commands. Reuse current configuration only
while its certificate/IP remain valid; use new output directories for repeats.
For the four direct binaries:

```bash
for test in timer_test rtcp_tcc_fb_test ws_protoo_client_test webrtc_session_expiry_test; do
  timeout --kill-after=5s 30s "build/wi004-debug/$test" || exit "$?"
done
```

For full lifecycle validation, stop the ordinary loopback SFU first; the runner
owns its SFU/GDB. Keep the loopback fixture server running:

```bash
WI003_BINARY=build/wi004-debug/RTCPilot WI003_CONFIG=build/wi004/loopback/config.json \
WI003_FULL=1 WI003_OUTPUT=build/wi004/evidence/pre-stun-repeat \
  timeout --signal=TERM --kill-after=10s 270s node scripts/baseline/run-pre-stun.mjs
```


## Additional Capture and Export Control

An extra export smoke probe initially used bare `chromium.launch`, which selected
`chromium-headless-shell`, unlike the checked-in drivers' explicit full Chrome
executable. Native capture failed there. Changing only the executable selection
to match the drivers made the probe pass. This is a probe/environment difference,
not a reason to relax browser security or a failure of the passing full-Chrome
media runs. `stats-export/result.json` preserves the failure;
`stats-export-final/result.json` and `export.json` prove collection starts,
downloads statistics without ICE username fragments and stops on leave.
This short control does not validate ten-minute physical operation.

The next minimum task is the pending physical portion of WI-004: two computers,
then three for ten minutes. Dependencies are available devices, a reachable
private address, valid normally trusted TLS, passing SFU/capture regressions and
per-device stats plus human observations. Run the prepared
`bash build/wi004/device-acceptance.sh` when available. It records PASS/FAIL/PENDING,
candidates, counter deltas, reconnect/rejoin and cleanup without changing trust
stores itself. Its record still needs review and cannot accept product gates.
Do not start meeting/subtitle implementation from automatic results alone.

## Loopback Boundary Repair and Completion Checks

Final review reproduced an additional boundary problem in the original loopback
Vite server: allowing the whole repository also allowed a harmless `.key` marker
inside the new TLS directory to be fetched through `/@fs`. No real private key
was requested. `loopback-boundary-before.json` preserves HTTP 200 and the failing
assertion. A one-line `serve.mjs` change limits allowed roots to the fixture and
pinned upstream checkout; `loopback-boundary-after.json` records HTTP 403 for the
same marker and HTTP 200 for the page/module. The repeatable probe is
`build/wi004/evidence/loopback-boundary-probe.mjs` (its original before/after
outputs are preserved; use a new output path when repeating the probe).

After that repair, `loopback-media-restricted/result.json` passes all two/three
browser, signaling-only reconnect, exit/continuity, same-ID rejoin and subsequent
notification phases, with a 12.343-second soak. This supplements the earlier
loopback run; it does not overwrite it. LAN serving already used a restricted
in-memory bundle and did not require another change.

`repository-checks.json` records `npm test` (5/5), `npm run check:deps`, all fixture
syntax checks, wizard syntax, Git whitespace and private-key ignore/index checks
passing. `npm run docs:verify` fails only on the existing skill link named above;
structure has zero errors/warnings and no other i18n error. Supplemental checks
found no whitespace problems in 19 task files, equal report command blocks, and
no private-key PEM text in evidence logs/JSON or these reports. Artifact hashes
are saved beside the results; no private keys are part of that manifest.
`final-checks.json` records the final `serve.mjs` hash, repeated documentation
and syntax checks, and the complete post-regression process/port audit.

`cleanup.json` and `loopback-restricted-cleanup.json` record stopped owned
servers/browsers and released ports. The latter also successfully rebinds the
loopback ports after the last regression. All LAN/loopback services are stopped
at handoff; restart them with LAN.md when devices become available. This checks
process/port release, not general graceful SFU shutdown. The existing gates and
physical-device acceptance remain open.
