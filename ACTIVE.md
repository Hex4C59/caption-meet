# CaptionMeet — Active work

English operational note: Living session state. Process: [collaboration guide](docs/guides/agent-collaboration.md).

**Session open:** @ this file only. Historical proposals and session details are linked below; they are not additional active work.

## In progress (WIP=1)

| Field | Content |
|-------|---------|
| **ID** | WI-004 |
| **Title** | LAN HTTPS/WSS and physical-device media baseline |
| **Phase** | Build |
| **Architecture** | Browser adapter, C-02/C-05/C-06 and trust boundaries in the [Proposed architecture](docs/architecture/caption-meet-architecture.md) |
| **Gate ID** | `gate-rtc-signaling`, `gate-sfu-build`, `gate-session-admission` |
| **Decision** | `spike-only` - authorized trusted-LAN fixture; no production deployment or gate closure |
| **PRD assessment** | technical-only: fixture evidence supporting REQ-002, REQ-004 and REQ-013; no meeting product delivery |
| **One-line goal** | Make the pinned fixture usable over normally trusted HTTPS/WSS and LAN media, distinguishing automatic checks from physical-device acceptance |
| **Proposal status** | Approved 2026-09-26; automatic baseline and handoff executed; same-LAN physical-device acceptance unverified |

### Current blocker and next action

The latest maintainer clarification identifies a headless Ubuntu **SFU server**
and one Windows computer. Ubuntu is not an interactive browser media endpoint;
the Windows camera/microphone readiness is unverified. The last confirmed
connection is remote-only, not a shared LAN. No later confirmation supersedes it.

**Next minimum task:** when a second desktop-Chrome computer with camera and
microphone is available on the required LAN with the SFU and first endpoint,
execute the existing two-device procedure. Collect each endpoint's original
start/middle/end statistics, OS/Chrome/time records and human audio/video
observations; then check signaling-only reconnect, leave and same-ID rejoin.
Three-computer, six-direction, ten-minute acceptance remains a separate pending
part of WI-004; a possible two-device run need not wait for a third computer.

Until those conditions are supplied, keep continuation to necessary session-state
updates. Do not repeatedly request device status, repeat media preflight, create
certificates or duplicate reports. The server needs no GUI for its SFU role.

### Scope, authorization and acceptance

The maintainer approved WI-004 on 2026-09-26 and renewed physical-device execution
authorization at 17:36 and 17:46 UTC. Effective scope remains dedicated service
start/stop, development config/certificate refresh, necessary small fixture or
compatibility repairs and affected regressions, subject to the device conditions
above. Full approval history and the original approach are in the
[recorded WI-004 proposal](docs/archive/2026-09-26-active-history.md#in-progress-wip1).

1. Reuse the pinned fixture, completed automatic baseline and existing wizard. Follow [LAN reproduction and rename notes](scripts/baseline/LAN.md); the prepared OS-specific handoff is `build/wi004-physical-20260926/DEVICE-HANDOFF.md`. Retain earlier artifacts and the compatibility symlink while they depend on it.
2. When a physical run becomes possible, recheck IP, ports, artifacts and TLS validity before starting dedicated services. Use normal browser certificate validation, the selected LAN interface, isolated test trust and only required listeners. Keep keys outside served paths, logs and Git.
3. Observe actual remote audio/video and per-device statistics, including same-report-ID/SSRC deltas and selected SFU candidates. Page load, WSS, preview or same-machine fake capture cannot establish physical acceptance. Include stopped-capture and no-duplicate rejoin observations.
4. Keep repeatable capture/preview/join/leave behavior, including denial, unavailable-device and cancellation states. Run affected build/direct-test/expiry/media regressions only when changes or failures justify them; add sanitizer verification if C++ lifetime behavior changes. Do not rerun the already passed full suite without cause.
5. Record pass/fail/unverified separately. Stop owned processes and revoke the run's temporary trust before handoff. Preserve original evidence and upstream attribution; keep Build/WIP=1 and all unresolved gates.

### Boundaries and risks

- Media stays through the in-tree RTCPilot SFU. Keep VoiceAgent/ASR and unrelated listeners disabled; no meeting/caption implementation, provider activation, paid API or real-media recording.
- This is a trusted-LAN fixture without verified membership authorization. TLS does not close the admission gate. No public/TURN/tunnel deployment or global trust/firewall/router changes under this scope; no browser security bypass.
- No production-timeout change, broad refactor, new requirement interview, to-tickets/implement phase, commit, push or gate closure. Use diagnosing-bugs for reproduced failures and wizard only for trust/device actions requiring the maintainer.
- Preserve WI-002/WI-003/WI-004 builds, failures and evidence. Process termination is not graceful-shutdown acceptance; unavailable devices are unverified, not a passed or failed physical test.

### Evidence and unresolved gaps

These are **recorded results**, not new executions in this documentation session.

| Result | Evidence and limit |
|--------|--------------------|
| Pass: Debug build, three direct tests and two/three-browser media | [WI-002 report](docs/reports/2026-09-26-meeting-baseline.md); synthetic local input, including six directions for 602.362 seconds and a bounded same-ID rejoin repair |
| Pass: pre-STUN expiry repair and reclamation regressions | [WI-003 report](docs/reports/2026-09-26-pre-stun-expiry.md); reproduced failure, repaired behavior, targeted ASan/UBSan and media controls; not a general ownership/shutdown audit |
| Pass: normal HTTPS/WSS, private-file boundaries and automated capture/media | [WI-004 LAN report](docs/reports/2026-09-26-lan-media-baseline.md); automatic local-browser evidence only |
| Pass: bounded continuation and prepared two-device handoff | [Physical-media handoff](docs/reports/2026-09-26-physical-media-handoff.md); owned services stopped and temporary isolated trust removed; Windows trust steps unexecuted |
| Pass: last read-only readiness check | [17:36 readiness report](docs/reports/2026-09-26-two-device-readiness.md); reusable artifacts and then-valid IP/TLS, not present-time network or certificate verification |
| Unverified: physical-device acceptance | Two usable same-LAN browser computers, real preview/remote media, human observations and physical reconnect/rejoin evidence remain missing; three-computer ten-minute acceptance also pending |
| Existing failure: upstream browser production build | 11 TypeScript errors recorded in WI-002; the development fixture does not repair that build |
| Existing failure: local documentation scan | Ignored `.agents/skills/setup-ts-deep-modules/SKILL.md` links to missing `./src/packages/README.md`; unrelated to product behavior |

[Gate status](docs/reference/architecture-gates.md) remains unchanged:
`gate-docs-baseline` and `gate-voice-agent-bridge` are **In spike**;
signaling, SFU build/boundaries/lifecycle, admission and media-capacity gates are
**Open**. CTest still has zero registered tests in the recorded results. Weak
networks, general graceful shutdown and three-input recognition-only integration
remain unverified. `gate-repo-layout` alone is Accepted through ADR 0001.

## History and evidence navigation

Read history only when a past decision or missing reproduction detail is needed.
Archiving a record does not close its work item or gates.

| Record | Location |
|--------|----------|
| WI-004 original proposal, authorization renewals and earlier sessions | [Session history](docs/archive/2026-09-26-active-history.md#in-progress-wip1); use the effective scope above for continuation |
| WI-003 executed repair; gates remain open | [Report](docs/reports/2026-09-26-pre-stun-expiry.md), [reproduction](scripts/baseline/PRE-STUN.md), [original proposal](docs/archive/2026-09-26-active-history.md#previous-work-wi-003-executed-gates-open) |
| WI-002 executed baseline; gates remain open | [Report](docs/reports/2026-09-26-meeting-baseline.md), [plan](docs/plans/meeting-baseline-spike.md), [original authorization](docs/archive/2026-09-26-active-history.md#previous-work-wi-002-executed-gates-open) |
| WI-001 not closed; documentation/bridge gaps retained | [Original proposal and amendments](docs/archive/2026-09-26-active-history.md#previous-work-wi-001-not-closed) |
| Earlier direction, naming and GitHub-publication sessions | [Historical session notes](docs/archive/2026-09-26-active-history.md#last-session); historical authorization is not an instruction to resume publication |

## Parking lot

Subsequent meeting implementation follows the [PRD](docs/product-requirements.md)
and unresolved evidence/decisions. The old coaching/themes/account queue is
superseded. Recording/replay, translation, accounts and wider deployment remain
outside the first release; none is a second active work item.

## Last session

- **Documentation maintenance (2026-09-26):** Authorized consolidation of this entry point and the bilingual architecture. Original session wording is preserved in the [history snapshot](docs/archive/2026-09-26-active-history.md); current architecture separates reusable constraints, superseded coaching details and meeting design questions. No WI phase, gate, product scope, source layout or implementation changed.
- **Verification:** `npm test` passes 5/5; `npm run check:deps` and `git diff --check` pass. All 256 affected local links/fragments and prior architecture anchors pass the additional check; snapshot bodies preserve the original wording. `npm run docs:verify` reports 0 structure errors/warnings and only the existing ignored-skill broken link noted above (0 new warnings or stale translations). No media/build suite was rerun.
- **Continuation:** The next product-validation step remains the two-device task above, subject to the existing device conditions. This session started no media service, certificate/trust operation, physical acceptance, paid API or Git publication.
