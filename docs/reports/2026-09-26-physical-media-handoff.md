# Physical Media Continuation and Handoff (WI-004)

English | [中文](2026-09-26-physical-media-handoff.zh.md)

- Type: Execution report
- Status: Independent preflight executed; physical-device acceptance unverified
- Date: 2026-09-26
- Authority: Observed execution evidence, not product acceptance or gate closure
- Related: [ACTIVE](../../ACTIVE.md), [previous WI-004](2026-09-26-lan-media-baseline.md), [LAN commands](../../scripts/baseline/LAN.md), [WI-003](2026-09-26-pre-stun-expiry.md), [WI-002](2026-09-26-meeting-baseline.md)

## Outcome and Authorization

The maintainer authorized dedicated service start/stop, configuration/development
certificate updates, necessary small fixture/compatibility repairs and affected
regressions. This authorization is recorded in ACTIVE; WI-004 remains **Build,
WIP=1**, with no gate closure, new work item, commit or push.

The maintainer reported the Ubuntu server and a Windows computer, then confirmed
that they connect **remotely, not on the same LAN**. There is no available pair
for the specified physical LAN test. Actual two-computer media, human listening
and changing-camera observation, three-computer ten-minute operation and physical
reconnect/rejoin are **unverified**. No physical-device JSON was received. The
session continued with independent work and did not repeat device requests or
introduce tunnels, TURN, public deployment, router or firewall changes.

All new local artifacts are under `build/wi004-physical-20260926/`. Earlier
WI-002/WI-003/WI-004 artifacts, failures, builds and upstream attribution remain.

## Executed Preflight

The active interface is still `enp94s0f0`, `10.10.16.135/27`. All three chosen
ports were free before startup. The pinned browser client remains clean at
`e08c241f2f80518ebe1138d2127215bb11a52a61`; no download/restoration was needed.
`cmake --build build/wi004-debug --parallel 4` exited 0 without rebuilding source.
The SFU and lifetime-test binaries match the earlier SHA-256 manifest. Fixture
hashes also match, using the previous `final-checks.json` for the last loopback
allowlist repair. No application or C++ source changed in this continuation.

Fresh run configuration and certificates were generated instead of overwriting
the previous valid run. The new CA/leaf validity is 2026-09-26 16:53:26 through
2026-10-03 16:53:26 UTC; leaf SAN is `IP Address:10.10.16.135`.

| Endpoint / certificate | Value |
|---|---|
| HTTPS page | `https://10.10.16.135:19081/browser.html` |
| Native SFU WSS | `wss://10.10.16.135:19080/webrtc` |
| SFU media | `10.10.16.135:19000/UDP` |
| Public PEM CA | `build/wi004-physical-20260926/run/ca.crt` |
| Public DER CA for Windows | `build/wi004-physical-20260926/public-share/voicecoach-ca.cer` |
| CA SHA-256 | `F6:EF:EC:64:A4:49:C7:AF:FD:3F:30:05:44:04:33:FC:3D:94:B8:70:9C:7F:AE:20:C0:FF:93:AA:ED:40:72:39` |
| Leaf SHA-256 | `7A:1A:90:A9:29:2E:E6:04:D3:77:8F:6A:29:56:11:E1:24:36:78:48:03:35:49:85:FD:F8:C8:85:D9:C9:3D:E5` |

The preflight ran at **16:55:58.620–16:56:20.866 UTC** using Node 22.22.3 and
full Chrome for Testing 151.0.7922.34 with sandbox and normal TLS validation.
Chrome received a dedicated `XDG_DATA_HOME` and profile; HOME, existing NSS
databases and system trust were not modified. A profile alone was not treated
as Linux certificate isolation.

## Passed

Evidence paths below are relative to the new run's `evidence/` directory.

| Check | Observed evidence |
|---|---|
| Artifact/IP/port/certificate preflight and incremental Debug build | `debug-incremental-build.log`, `preflight/result.json` |
| Normal HTTPS/WSS validation | `preflight/browser-trust/result.json`: untrusted CA rejects with `ERR_CERT_AUTHORITY_INVALID`; trusted page returns 200, TLS 1.3, secure context, WSS opens/closes 1000; existing trust metadata unchanged |
| TLS/static/private-file boundaries | `preflight/tls-boundary/result.json`: wrong hostname and untrusted CA rejected; bundle assets served; private/config/source/development paths 404 and POST 405; optional services disabled and private-key permissions restricted |
| Short local media preflight | `preflight/media/result.json`: two local Chrome processes using explicitly fake capture devices; both directions pass; 12.304-second soak; no real media recording or screenshots |
| Counter/candidate audit | `media-audit-and-trust-cleanup.json`: same RTP report ID and SSRC in each compared interval; both receive directions and publishers select the SFU; audio/video bytes and decoded frames increase |
| Client cleanup | Both fake-device clients report closed peers, ended tracks, closed audio contexts and zero remotes |
| Wizard preparation | `device-wizard-checks.json`: six stages, Bash syntax, unchanged template library and 14 static checks pass; interactive procedure not run |
| Repository checks | Root tests 5/5, dependency check, syntax and whitespace checks pass; final command/security/cleanup records are in `completion-checks.json` |

For the final approximately 2.23-second sampled interval, Alice receiving Bob
had audio/video byte deltas **1,324 / 43,000** and **45** decoded frames; Bob
receiving Alice had **1,274 / 41,275** and **46** decoded frames. These are
same-machine fake-hardware measurements, not human audio/video acceptance.

## Device Handoff Changes

The original wizard was preserved. The new
`build/wi004-physical-20260926/device-acceptance.sh` reads this run's manifest,
records actual LAN/device conditions and leaves unavailable stages PENDING.
Two-computer operation now saves start/middle/end raw JSON and includes
candidate/counter review plus post-observation signaling-only reconnect and
same-ID rejoin. Three-computer operation separately requires at least ten
minutes, six human receive observations and all three raw collections. It does
not infer continued media from page loading, WSS or preview.

The adjacent `DEVICE-HANDOFF.md` contains all three full device URLs, public CA
fingerprints, service commands, Ubuntu full-Chrome/XDG trust and revocation,
Windows CurrentUser trust and exact-certificate removal, and raw JSON return via
existing authenticated file transfer or USB into `evidence/physical/<device>/<phase>/`.
No upload endpoint or broader static allowlist was added. The distribution
directory contains only the public DER CA, whose bytes match the public certificate.

Windows instructions are prepared, not executed. CurrentUser Root affects that
Windows user's applications which read the OS trust store; a separate Chrome
profile does not isolate it. The guide explicitly avoids LocalMachine/global
trust, records whether the CA is newly added, and removes only that certificate.
This follows [Chromium's local trust documentation](https://chromium.googlesource.com/chromium/src/+/main/net/data/ssl/chrome_root_store/faq.md)
and [Microsoft's store-scope documentation](https://learn.microsoft.com/en-us/windows-hardware/drivers/install/local-machine-and-current-user-certificate-stores).
There is no reason to install it while the Windows computer remains off-LAN.

## Failures, Unverified and Existing Issues

- **New execution failures:** none in the bounded build/TLS/media preflight.
  Rejected untrusted CA/hostname/private routes are expected security controls.
- **Repository failure:** full `npm run docs:verify` retains the known unrelated
  `.agents/skills/setup-ts-deep-modules/SKILL.md` → `./src/packages/README.md`
  broken link; its raw output is preserved in `documentation-check.log`.
- **Unverified:** actual cross-computer LAN reachability; real camera/microphone
  preview and permission behavior; two human receive directions; six receive
  directions for ten minutes; physical signaling-only continuity, exit indicators,
  no-duplicate same-ID rejoin; Windows trust/import/revocation on the actual OS.
- **Existing, not rerun:** CTest zero registered tests, the pinned upstream
  production TypeScript errors, previous failed probes, weak-network and general
  graceful-shutdown gaps. ShellCheck is unavailable; wizard syntax/static review
  is not interactive or Windows execution evidence.

No C++ lifecycle change occurred. Earlier direct timeout, WI-003 full lifecycle,
ASan/UBSan and full multi-browser reconnect/rejoin results remain historical
evidence; repeating the entire passed suite was unnecessary for fresh TLS/config
and manual handoff changes. Production timeout remains 35 seconds. VoiceAgent,
ASR, captions, admission/product work and unrelated services were not activated.

## Cleanup and Reproduction

Owned SFU PID 3771864 and HTTPS PID 3771865 stopped; automatic browsers closed.
The runner successfully rebound TCP 19080/19081 and UDP 19000 afterward.
RTCPilot was terminated with SIGTERM; this is process cleanup, not graceful
application shutdown. The new CA was removed from this run's isolated NSS
database and a subsequent lookup rejected it as absent. Windows trust was never
installed. Private keys remain in the ignored protected run directory; neither
they nor real audio/video are in distribution or evidence files.

`run-preflight.mjs` in the run directory records commands, artifact hashes,
listeners, results and bounded owned-process cleanup. To repeat only this short
automatic preflight while the current IP/certificate remain valid, use fresh
trust/evidence directories (services must initially be stopped):

```bash
node scripts/baseline/prepare-browser-trust.mjs \
  build/wi004-physical-20260926/run/ca.crt \
  build/wi004-physical-20260926/trust-repeat-01
WI004_TRUST="$PWD/build/wi004-physical-20260926/trust-repeat-01" \
  node build/wi004-physical-20260926/run-preflight.mjs \
  build/wi004-physical-20260926/evidence/preflight-repeat-01
build/wi004/tools/usr/bin/certutil -D \
  -d "sql:$PWD/build/wi004-physical-20260926/trust-repeat-01/pki/nssdb" -n WI004-Test-CA
```

Do not reuse the already-revoked automatic `trust-data` as if it still trusts the
CA. For expired certificates or changed IPs, use a fresh run and refresh handoff
values first. The [LAN guide](../../scripts/baseline/LAN.md) covers pinned-source
restoration; the local device handoff covers full manual service/trust steps.

The **next minimum task is still within WI-004**: obtain one additional real
camera/microphone computer on the same LAN, then execute the two-device wizard
and review both original statistics plus human observations. Add the third
computer and ten-minute six-direction evidence when available. This continuation
does not justify starting meeting/caption implementation or closing any gate.
