# Two-Device Readiness Recheck (WI-004)

English | [中文](2026-09-26-two-device-readiness.zh.md)

- Type: Execution report
- Status: Read-only readiness recheck executed; physical acceptance unverified
- Date: 2026-09-26, session opened 17:36 UTC
- Authority: Current readiness evidence, not media acceptance or gate closure
- Related: [ACTIVE](../../ACTIVE.md), [previous execution](2026-09-26-physical-media-handoff.md), [LAN procedure](../../scripts/baseline/LAN.md)

## Authorization and Device Conditions

The maintainer renewed authorization for dedicated service control, development
configuration/certificates, small necessary fixture repairs and affected
regressions for two real computers on the same LAN. ACTIVE records the scope;
WI-004 remains Build/WIP=1. Third-computer ten-minute acceptance remains pending.

One current-device question asked only the available computer count, operating
systems and same-LAN conditions. No new answer had arrived at handoff. The last
confirmed condition remains an Ubuntu server and a Windows host connected
remotely, not on the same LAN. This report does not infer that their condition
has changed or claim a fresh confirmation of unavailability.

No physical media was attempted and no per-device statistics were received.
Service startup/trust installation depends on establishing the actual device
conditions. The passed automatic media suite was not repeated to substitute
for missing physical computers. No tunnel, public-network or TURN work began.

## Executed Evidence

New evidence is under `build/wi004-two-device-20260926T1736/`; prior directories
and failed evidence remain intact.

| Result | Evidence |
|---|---|
| Pass: LAN IP remains `10.10.16.135/27` on `enp94s0f0` | `readiness.json`, actual `ip -brief -4 addr` |
| Pass: no listeners on TCP 19080/19081 or UDP 19000 | `readiness.json`, actual `ss -lntup` |
| Pass: existing CA/leaf currently valid, exact IP SAN and chain verification | `readiness.json`, OpenSSL verification exits 0; expiry 2026-10-03 16:53:26 UTC |
| Pass: existing wizard, handoff, fixture and SFU artifacts match prior evidence | `artifact-and-trust-audit.json`; ACTIVE changes are the new session record |
| Pass: prior isolated CA remains removed | Same audit: empty dedicated NSS listing and certificate lookup returns not found; no import/removal performed |
| Unverified: physical media and lifecycle acceptance | No physical stats or interactive wizard records found in the inspected baseline build paths |

The existing manifest, certificates, wizard and OS-specific handoff are reusable
while their IP/validity checks hold. Nothing required another certificate or
fixture copy. Full Alice/Bob URLs, public CA and fingerprints, Ubuntu/Windows
trust scope/removal and original JSON transfer steps remain in
`build/wi004-physical-20260926/DEVICE-HANDOFF.md`. The isolated `trust-data`
database is still **untrusted** despite its retained trust-manifest file.

The read-only check can be reproduced without starting media services:

```bash
ip -brief -4 addr
ss -lntup | rg ':(19000|19080|19081)\b'
openssl verify \
  -CAfile build/wi004-physical-20260926/run/tls/ca.crt \
  -verify_ip 10.10.16.135 \
  build/wi004-physical-20260926/run/tls/server.crt
```

An empty `rg` result exits 1 and means no matching listener; it is not a failed
media test. Certificate verification alone does not establish browser trust,
remote reachability, WSS or media.

## Completion and Remaining Work

This session started no SFU, HTTPS server, browser or capture process, and added
no certificate trust. There is no new owned service or trust to remove. The
earlier cleanup evidence remains preserved. No application/C++ code, private
keys, static allowlist, firewall, router, production timeout, VoiceAgent/ASR or
upstream attribution changed; no commit, push or gate closure occurred.

`repository-checks.json` records the required dependency/documentation checks
and whitespace review. The known documentation failure remains the unrelated
`.agents/skills/setup-ts-deep-modules/SKILL.md` link to `./src/packages/README.md`.
CTest registration and the upstream TypeScript build errors remain existing
issues, not rerun here. No changed implementation required media, C++ or sanitizer
regressions; earlier passing results are historical, not new test runs.

Still missing: confirmation of two usable same-LAN computers, their OS/Chrome
versions, real preview, both human receive observations, per-device start/middle/
end JSON with same-report-ID/SSRC deltas and selected SFU candidates, and the
subsequent signaling-only continuity, stopped-capture and same-ID rejoin evidence.
Three-computer ten-minute/six-direction acceptance remains separate and unverified.

The next minimum action is to establish those two-device conditions, then start
the existing dedicated fixture and execute its two-device wizard. Do not repeat
another full automatic preflight or start a new implementation work item merely
because physical conditions remain unconfirmed.
