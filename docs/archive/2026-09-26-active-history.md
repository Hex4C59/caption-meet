# Active work history before the documentation cleanup

- Type: Session history
- Status: Archived
- Archived: 2026-09-26
- Authority: Historical context only; current work and effective authorization are in [ACTIVE.md](../../ACTIVE.md)

This snapshot preserves the pre-cleanup session record, including earlier WI
proposals, authorization renewals, maintenance notes and evidence summaries.
Only relative Markdown links were rebased for this location; original wording
below is retained. This English operational record follows ACTIVE.md's language
exception and does not introduce a separate Chinese session-state document.

**Read as history.** All “current”, “next”, “approved”, phase and WIP statements
below describe their recorded sessions. They are not instructions to resume an
old task or to perform a Git publication, service or trust operation. Archiving
these records neither accepts a work item nor closes a gate. Consult the live
[gate register](../reference/architecture-gates.md) and ACTIVE before acting.

## Recorded snapshot

English operational note: Living session state. Process: `docs/guides/agent-collaboration.md`.

**Session open:** @ this file only.

## In progress (WIP=1)

| Field | Content |
|-------|---------|
| **ID** | WI-004 |
| **Title** | LAN HTTPS/WSS and physical-device media baseline |
| **Phase** | Build |
| **Architecture** | Browser adapter, C-02/C-05/C-06 and trust boundaries in the [Proposed architecture](../../docs/architecture/caption-meet-architecture.md) |
| **Gate ID** | `gate-rtc-signaling`, `gate-sfu-build`, `gate-session-admission` |
| **Decision** | `spike-only` - explicitly authorized trusted-LAN test fixture, no production deployment or gate closure |
| **PRD assessment** | technical-only: fixture evidence supporting REQ-002, REQ-004 and REQ-013; no meeting product delivery |
| **One-line goal** | Make the pinned fixture usable over normally trusted HTTPS/WSS and LAN media, with distinct automatic and physical-device evidence |
| **Proposal status** | Approved 2026-09-26; continuation preflight and handoff executed; same-LAN physical-device acceptance unverified |

### WI-004 scope and authorization

The maintainer authorized configuration parameterization, development certificate generation,
fixture changes, necessary small compatibility repairs and actual regression execution.
This is the only active WI. Preserve WI-003/WI-002 evidence and unresolved gates.
No new interview or to-tickets/implement phase. Use diagnosing-bugs for failures;
use wizard only for trust/device actions that require the maintainer.

### WI-004 physical-device continuation authorization (2026-09-26)

The maintainer explicitly authorized this continuation: start/stop dedicated
services, refresh configuration/development certificates, make necessary small
fixture/compatibility repairs and execute affected regressions. Keep Build and
WIP=1, preserve WI-002/WI-003/WI-004 evidence, and do not commit, push or close
gates. Recheck IP/ports/artifacts/TLS before use; collect actual physical media
evidence only when devices are available. Stop owned processes and revoke this
run's temporary trust before handoff. Do not repeat the already passed full suite
without a changed-code or failure reason.

The maintainer reports this Ubuntu server and one Windows computer, and confirms
they are connected remotely, not on the same LAN. Physical two-device acceptance
cannot run under the current conditions. A third computer and ten-minute
six-direction physical acceptance remain unverified. No requirement interview,
to-tickets/implement, global trust/firewall/router changes, browser security bypass,
real-media recording or VoiceAgent/ASR activation is authorized.

### WI-004 two-device execution authorization (2026-09-26, 17:36 UTC)

The maintainer renewed execution authorization for the next minimum task:
two real camera/microphone computers on the same LAN, with per-endpoint
start/middle/end statistics and human audio/video observations, followed by
signaling-only reconnect, leave and same-ID rejoin. Dedicated service control,
development configuration/certificates, necessary small compatibility repairs
and affected regressions are authorized. Three-computer ten-minute acceptance
remains a separate unverified part of this same WI; do not wait for a third
computer before a possible two-device run.

Reconfirm only device count, OS and same-LAN conditions; do not assume that the
previous remote-only Windows connection has changed. Reuse the passed automatic
baseline and existing wizard, and do not repeat the full suite without cause.
Preserve Build/WIP=1, all historical evidence and the existing boundaries above.
No to-tickets/implement, commit, push, new network deployment or gate closure.

Continuation at 17:46 UTC: the maintainer reaffirmed this authorization but
left the device fields as placeholders. Current OS/hardware, same-LAN status
and operator availability are still unconfirmed. Asked once for the actual
values; do not infer readiness from the copied prompt. Per the explicit request,
only necessary session state is updated until those conditions are established:
no repeated media preflight, new certificates or duplicate execution report.

The maintainer then clarified: Ubuntu is a server without a graphical desktop;
the other computer is Windows. Under the current setup Ubuntu is the SFU host,
not an available interactive browser media endpoint. Only one potential browser
test computer is identified; its camera/microphone readiness is unverified.
Physical two-device acceptance therefore needs another desktop-Chrome computer
with camera/microphone and the required same-LAN connectivity. No new same-LAN
confirmation supersedes the earlier remote-only topology. The SFU server does
not need a graphical desktop for its server role. Do not request repeated device
status or install a GUI as an incidental workaround.

### Approach and observable acceptance

1. Create a separate ignored LAN run directory; retain default loopback mode. Parameterize page/signaling/listen/candidate settings and use native SFU WSS.
2. Generate certificates with correct SANs; verify HTTPS/WSS through normal browser validation. Keep keys outside served paths, logs and Git. Use isolated test trust, never certificate bypass flags.
3. Keep media through the existing SFU and VoiceAgent/ASR/unrelated listeners disabled. Bind only the selected LAN interface and required ports; no public/TURN deployment.
4. Preserve synthetic automated media and add recoverable real-device capture/preview/join/leave/rejoin to the fixture, including denial/unavailable/cancellation states; collect stats, not recordings.
5. First run automatic security/media checks, then prepare a verified URL and bounded steps for another physical computer. Three available computers must sustain ten minutes with per-endpoint media stats and human audio/video confirmation.
6. Distinguish local browsers, another physical device and three physical devices. Unavailable devices remain unverified; do not mark all WI-004 accepted from automation.
7. Run Debug build, existing three timeout tests, WI-003 expiry and affected media/reconnect regressions. Add sanitizer checks if C++ lifetime behavior changes.
8. Document commands, network/certificate setup, pass/fail/unverified results and next task; clean owned processes/listeners after verification and run repository checks.

### Boundaries and risks

No global system trust/firewall/router changes without a concrete reviewed action;
no paid API, meeting/caption feature, timeout change, large refactor, commit or push.
This trusted-LAN development fixture has no verified membership authorization;
TLS does not close the admission gate. Keep certificate private keys inaccessible
through the page server and avoid recording real audio/video. Preserve upstream
attribution and original evidence. Existing CTest, upstream TypeScript and skill-link
failures remain separately recorded.

### Last session: WI-004 two-device readiness (2026-09-26, 17:36 UTC)

- Renewed execution authorization is recorded above. Asked once for current computer count, OS and same-LAN conditions; no new answer had arrived at handoff. Last confirmed Ubuntu/Windows topology is remote-only. Physical preview, media, human observations and lifecycle checks remain unverified, not failed or passed.
- Executed a bounded read-only recheck: LAN IP and certificate remain valid, three fixture ports have no listeners, and existing fixture/SFU/wizard/handoff artifacts remain reusable. Prior isolated NSS CA remains absent. No new physical JSON or interactive wizard record was found in the baseline build paths.
- No service/browser/capture started and no trust added; no new owned resources need cleanup. Reused the existing handoff instead of regenerating certificates or repeating the passed media/lifecycle suite. Historical evidence and failures remain intact.
- See the [readiness report](../../docs/reports/2026-09-26-two-device-readiness.md) ([Chinese](../../docs/reports/2026-09-26-two-device-readiness.zh.md)) and `build/wi004-two-device-20260926T1736/` for commands and checks. WI-004 stays Build/WIP=1 with open gates; no commit/push or new implementation work.
- Next minimum action: establish two available same-LAN camera/microphone computers, then run the prepared two-device wizard and review per-endpoint original JSON plus human observations. Third-computer ten-minute evidence remains pending separately.

### Previous session: WI-004 physical-device continuation (2026-09-26)

- Executed independent work after the maintainer confirmed Ubuntu/Windows are remote-connected, not on the same LAN. No physical preview, human listening, two-computer media, three-computer ten-minute media or physical reconnect/rejoin is claimed. WI-004 remains Build, WIP=1; all gates stay open.
- Rechecked `enp94s0f0` / `10.10.16.135/27`, free ports and pinned artifacts. Incremental Debug build passed; SFU/test binary and fixture hashes match the previous final evidence. No restoration, application/C++ repair or repeated full lifecycle/sanitizer suite was needed.
- Created `build/wi004-physical-20260926/` with fresh configuration, seven-day certificates, manifest and isolated NSS trust. Started dedicated SFU/HTTPS; passed normal Chrome 151 HTTPS/WSS validation, negative trust/hostname controls, static/key boundaries and a short two-local-browser fake-device media check (12.304-second soak). Same RTP ID/SSRC deltas and selected SFU candidates were audited separately. These results do not replace real computers.
- Refreshed the one-run wizard, preserving its old version. Two-computer operation now includes start/middle/end JSON, candidate/counter review and post-observation reconnect/rejoin. Added exact Ubuntu/Windows trust scope/revocation, full URLs and manual raw-JSON transfer in `build/wi004-physical-20260926/DEVICE-HANDOFF.md`. Wizard syntax and 14 static checks pass; interactive Windows/device actions remain unexecuted.
- Stopped owned SFU/HTTPS and test browsers, verified all three ports can bind again, and removed this run's CA from its isolated NSS database. Existing user trust metadata remained unchanged; Windows trust was never installed. Keys remain ignored/private; the distribution directory contains only the public DER CA.
- See the [continuation report](../../docs/reports/2026-09-26-physical-media-handoff.md) ([Chinese](../../docs/reports/2026-09-26-physical-media-handoff.zh.md)) for raw evidence, reproducible commands, checks and remaining gaps. Previous WI-004/WI-003/WI-002 evidence and original failures are retained.
- Next minimum task within WI-004: when a second real computer with camera/microphone is on the same LAN, execute the prepared two-device observation and collect both original JSON/OS/Chrome/time records. Third-computer six-direction ten-minute acceptance follows when available. Do not advance meeting/caption implementation or gate closure from this preflight.

### Previous session: WI-004 execution (2026-09-26)

- Delivered independent LAN config/TLS generation, normally trusted HTTPS/WSS, a restricted bundle server and native camera/microphone preview/join/retry/leave/rejoin. Original loopback mode and prior evidence remain. See the [execution report](../../docs/reports/2026-09-26-lan-media-baseline.md) and [reproduction steps](../../scripts/baseline/LAN.md).
- Passed fresh Debug build, original three direct timeout tests, focused lifetime test and all four WI-003 real-signaling lifecycle phases. No C++ change or production timeout adjustment; prior sanitizer evidence remains applicable to the unchanged repair.
- Passed isolated normal Chrome trust (including untrusted rejection), HTTPS private-file boundary checks, LAN two/three-browser synthetic media and reconnect/rejoin (47.331-second soak), native fake-device media (12.366 seconds), nine capture-state checks, stats-export smoke and mobile/desktop fixture checks. Six media directions select RTCPilot at 10.10.16.135:19000/UDP. Loopback media regression also passed.
- Preserved initial failed permission tests, then corrected async readiness polling and obtained passing regressions. Separate smoke-probe failures used an implicit headless-shell executable or an invalid error page; full Chrome controls passed without security bypasses.
- The maintainer said other computers were unavailable. Real two/three-computer media, human listening, real camera/microphone hardware and ten-minute physical stability remain unverified. WI-004 stays Build and is the only WIP; no gate is closed.
- Prepared `build/wi004/device-acceptance.sh` with explicit PASS/FAIL/PENDING and stats collection, candidate review, reconnect/rejoin and cleanup. Wizard syntax/structure checks passed; the interactive procedure was not run.
- LAN address and certificate are recorded in `build/wi004/run/lan.json`; certificate expires 2026-10-03. Keys stay under ignored build output. No global trust/firewall/router change, paid API, commit or push. All four owned page/SFU services stopped after automatic verification; final check evidence is under `build/wi004/evidence/`.
- Existing gaps remain separate: CTest registration is zero, upstream TypeScript production build has the previously recorded errors, and the unrelated skill link still needs its own work. Repository checks and final process/port evidence are recorded in the report.
- Final boundary review reproduced a harmless private-directory marker exposed by the old loopback Vite allowlist (HTTP 200). Restricted `serve.mjs` to fixture/upstream roots, proved HTTP 403, then passed the full loopback media/reconnect/rejoin regression again (12.343-second soak). Real keys were never requested; all owned retest processes/ports were released.
- Completion checks: root tests 5/5, dependency check, all fixture/wizard syntax, tracked/untracked whitespace and private-key ignore/index checks pass. Documentation verification fails only on the known unrelated skill link; see `build/wi004/evidence/repository-checks.json` and final check/cleanup records.
- Next minimum task: finish this WI's physical-device acceptance, first two computers and then three for ten minutes, using valid trusted certificates and per-device JSON plus human observations. Do not start meeting/caption implementation from same-machine results alone.

---

## Previous work: WI-003 (executed; gates open)

| Field | Content |
|-------|---------|
| **ID** | WI-003 |
| **Title** | Pre-STUN session expiry and resource reclamation |
| **Phase** | Build |
| **Architecture** | [Lifecycle and ownership](../../docs/architecture/caption-meet-architecture.md#task-reading-guide), C-05; Proposed constraints |
| **Gate ID** | `gate-sfu-lifecycle`, `gate-sfu-build` |
| **Decision** | `none` - bounded repair; no policy change or gate closure |
| **PRD assessment** | technical-only: transport expiry regression supporting REQ-013; no new meeting feature |
| **One-line goal** | Reproduce no-first-STUN expiry through real signaling, prove resource cleanup and preserve active media |
| **Proposal status** | Approved execution completed on 2026-09-26; evidence recorded, existing gates remain open |

### WI-003 scope and authorization

The maintainer approved diagnosis, regression tests, minimal C++ repair and necessary
fixtures; requested actual execution without another interview. Use diagnosing-bugs.
The prior 25/22 destruction audit is a lead, not proof of a leak. Preserve WI-002
below and its open gates; WI-003 is the only active work item.

### Approach and observable acceptance

1. Establish a bounded unattended real-signaling reproduction with no first STUN; preserve failing registry, object and timer evidence before repair.
2. Rank falsifiable hypotheses, add the regression before the minimum fix, and verify both indexes and resource reclamation rather than only logs or RSS.
3. Expired sessions disappear, active sessions survive, first STUN before expiry renews activity, and late STUN cannot revive a reclaimed session.
4. Repeated create/expire cycles return resource counts to baseline. Keep production timeout at 35 seconds and test time controls local.
5. Run Debug build, new regression, three existing timeout tests, targeted ASan/UBSan and WI-002 media/signaling-only/same-ID rejoin regressions. Record CTest registration separately.
6. Clean owned processes/ports, save reproducible evidence, update ACTIVE and run repo checks; distinguish pass/fail/unverified and existing issues.

### Boundaries and risks

Preserve dirty files, build directories, evidence and attribution. No global clock
or ownership redesign, graceful-shutdown project, meeting/caption/ASR development,
paid APIs, unrelated skill edits, commits, push, to-tickets or implement. Keep
single-loop ownership; validate aliases, destruction and late callbacks. Do not
add a production network diagnostic endpoint. Known skill-link failure is report-only.
Any necessary expansion requires concrete evidence and a bounded proposal.

### Last session: WI-003 execution (2026-09-26)

- Completed the authorized repair and verification; remains Build for this evidence handoff, with WIP=1 and no gate closure. See the [execution report](../../docs/reports/2026-09-26-pre-stun-expiry.md) and [reproduction commands](../../scripts/baseline/PRE-STUN.md).
- Two real-signaling failures on the preserved original binary: no STUN after about 40 seconds, username/session still 1 and timers 7 versus baseline 5. A minimized real-object test also failed on old code and passed after repair; evidence is under `build/wi003/evidence/`.
- Root cause: timeout scanning only the address registry omitted sessions registered through signaling before first STUN. The local fix selects expired registered sessions, removes all matching index entries and releases objects after traversal. Default timeout remains 35 seconds; no clock or ownership redesign.
- Pass: fresh Debug build, no-STUN expiry, late-STUN rejection, repeated reclamation, active renewal, multiple address aliases and 20 local cycles; original three direct timeout tests; targeted ASan/UBSan with leak detection; two/three Chrome media, signaling-only reconnect and same-ID rejoin, plus 47.343-second soak.
- Pass: final unattended fixture run and SIGTERM cancellation cleanup; all owned Chrome/GDB/SFU/Vite processes stopped, ports 18000/18080/18081/9002 clear. Process stop is not graceful-shutdown acceptance.
- Repository checks: `npm test` 5/5, `npm run check:deps` and `git diff --check` pass. `npm run docs:verify` still fails only on the pre-existing `.agents/skills/setup-ts-deep-modules/SKILL.md` relative link `./src/packages/README.md`; no unrelated skill changed.
- Existing gaps: CTest still registers 0 tests; pinned upstream production TypeScript build remains failed as recorded in WI-002. Three computers, trusted LAN HTTPS/WSS, real devices, weak networks and general shutdown remain unverified. WI-002 history and attribution preserved; no commit/push or paid API.
- Next smallest proposed task: LAN HTTPS/WSS access with this same fixture, then physical-device acceptance. Depends on repaired Debug/media evidence, a reachable LAN candidate, browser-trusted secure contexts and available computers. It is not started in this session.

---

## Previous work: WI-002 (executed; gates open)

| Field | Content |
|-------|---------|
| **ID** | WI-002 |
| **Title** | Meeting media baseline: build and browser interoperability |
| **Phase** | Build |
| **Architecture** | [Proposed architecture](../../docs/architecture/caption-meet-architecture.md), with the meeting scope transition noted |
| **Gate ID** | `gate-sfu-build`, `gate-rtc-signaling` |
| **Decision** | `spike-only` |
| **PRD assessment** | technical-only: prepare and validate the media baseline supporting REQ-002, REQ-004 and REQ-013; no meeting feature delivered by this proposal |
| **One-line goal** | Reproduce the in-tree build/tests and collect browser audio/video interoperability evidence before implementation tickets |
| **Proposal status** | Approved execution completed with evidence and explicit gaps; remains Build, no gate closure |

## WI-002 proposal

### Goal and scope

- The maintainer confirmed the complete meeting scope on 2026-09-26 with "准确了"
  and authorized specification preparation plus the first technical-validation proposal.
- The [PRD](../../docs/product-requirements.md) now describes the three-person LAN meeting;
  its scope choices are confirmed, while technical defaults remain Draft.
- Execution followed the [baseline plan](../../docs/plans/meeting-baseline-spike.md):
  clean Debug build, direct existing tests, then two-browser and three-browser audio/video.
- Use the repo's existing local work tracking: this file owns the current WI, and
  PRD requirement IDs own scope. No external tracker publication is authorized.

### Approach and risks

- Keep the SFU in-tree, use fresh ignored build/config output, preserve existing
  build directories and separate baseline observations from product acceptance.
- ASR and unrelated media listeners are disabled for the first media baseline;
  no provider activation or paid API calls are needed.
- The upstream browser demo is not present in the product shell. Review a pinned
  client fixture and its actual setup before running it; do not invent its commands.
- Tests depend on assertions and are not registered with CTest. Missing dependencies,
  failing tests, TLS/secure-context issues or incompatible signaling are evidence
  to report, not permission for broad refactoring or unsupported pass claims.
- A 10-hour investigation timebox is proposed; it is not a completion estimate.

### Observable acceptance

1. Record tool/dependency/source versions and exact build/test results.
2. Directly run the three existing test executables in Debug with timeouts;
   record the CTest registration gap separately.
3. With a reviewed browser fixture, demonstrate real remote audio and changing
   remote video in two instances, then three; document any blocking failure.
4. Record cleanup, relevant media statistics and sanitized configuration/client
   provenance. Multiple instances do not substitute for final three-computer acceptance.
5. Update evidence and remaining gaps before proposing fixes or implementation tickets.
   No named gate is closed by a successful spike alone.

### Out of scope

Meeting UI implementation, the three-person product cap, caption integration,
recording, new frameworks, source-wide refactors, paid ASR, external publication
and commits. Three-computer product acceptance follows in later work.

### Approval and next action

On 2026-09-26 the maintainer explicitly approved execution of the baseline plan,
including necessary small build, compatibility and test-fixture repairs. Proceed
in Build without another requirements interview. Preserve existing changes and
builds; no paid APIs, integration-policy changes, broad refactors, commits or push.
Run the actual build, three direct tests and two/three-browser media checks, retain
reproduction evidence, verify cleanup, and report failures separately from unverified
three-computer acceptance. Do not start to-tickets or implement in this session.
WI-001 is previous work, not a second active WI and not retrospectively completed.

---

## Previous work: WI-001 (not closed)

The following preserves earlier decisions and evidence. Its former Build status is
historical. Documentation/bridge gates remain unresolved; the confirmed meeting
direction supersedes the old proposed coaching implementation queue.

### Recorded WI-001 state

| Field | Content |
|-------|---------|
| **ID** | WI-001 |
| **Title** | Docs baseline + dependency check + RTCPilot read-only spike |
| **Phase** | Build |
| **Architecture** | [`docs/architecture/caption-meet-architecture.md`](../../docs/architecture/caption-meet-architecture.md) |
| **Gate ID** | `gate-docs-baseline`, `gate-voice-agent-bridge`, `gate-repo-layout` |
| **Decision** | `spike-only` |
| **PRD assessment** | technical-only: WI-001 establishes workflow, PRD MVP outline only; no user-visible delivery |
| **One-line goal** | Bootstrap engineering-template workflow; verify `third_party/RTCPilot`; green `docs:verify` |
| **Proposal status** | Approved |


### Recorded WI-001 proposal

### Goal and scope

- Adopt [engineering-template](https://github.com/Hex4C59/engineering-template) skeleton in this repo.
- Merge former `docs/产品说明.md` into PRD; architecture basename `voice-coach-architecture`.
- Run `scripts/check-deps.sh` and read-only RTCPilot spike (`voice_agent` path + config docs).
- **Not in scope:** `apps/web` join UI, server APIs, running full RTCPilot build, VoiceAgent deploy.

### Approach and risks

- Bootstrap without `--force` on existing README; merge product narrative manually.
- Spike: confirm `third_party/RTCPilot` exists; document `src/webrtc_room/voice_agent/` and config guides—no upstream code changes.
- Source policy superseded by approved ADR 0001: `third_party/RTCPilot` is the product's maintained SFU, not a dev-only sibling dependency.

### Architecture redesign scope amendment (2026-09-21)

Maintainer requested a modular redesign with narrow interfaces, explicit dependencies, contracts and ownership, without diagrams. Authorized work in this session is documentation and read-only source inspection only; not C++ refactoring or approval of every proposed API.

- Deliverable: rewrite the existing bilingual primary architecture as Proposed; contracts C-01 through C-06 remain Outline.
- Approach: evidence-based modular single-loop SFU; separate control, registry, media routing, voice adapter and AI publisher; retain ADR 0001.
- Decision for eventual implementation: `adr-after-approval`. No new Accepted ADR or gate closure in this session.
- PRD assessment: technical-only design; correct the obsolete anti-vendoring non-goal, but do not approve product behavior or select a web/server framework.
- Acceptance: no diagrams; each target module has public capabilities, dependencies, forbidden responsibilities and ownership; contracts cover errors/cancellation/correlation; current gaps and staged tests are explicit; documentation checks pass.
- Risks: target interfaces are unimplemented; clean SFU build, protocol interoperability, lifecycle safety and admission remain unverified.
- Next implementation work requires proposal confirmation and focused spikes; do not automatically proceed to web UI.

### Progressive loading amendment (2026-09-21)

Maintainer approved completing the proposed reading routes. Scope: existing AGENTS pair, documentation index pair and architecture pair; no application changes, automatic-injection rules or generated governance-guide edits. Decision: `none`; PRD assessment: technical-only navigation, no product requirement changes.

Acceptance: preserve kernel baseline/full collaboration read; explicit task triggers and precise paths; one architecture task-to-section index; language selection, expansion and stopping rules; no duplicated contracts or new module stubs. Run documentation verification and check new anchor targets explicitly (the current verifier checks files, not anchor existence). This amendment does not close WI-001 or any gate.

### Acceptance (maintainer)

1. `npm run docs:verify` exits 0.
2. `npm run check:deps` succeeds when `third_party/RTCPilot` is present.
3. Architecture + gates list RTCPilot/`voice_agent` integration points; PRD contains MVP outline for WI-002+.
4. `docs/产品说明.md` removed after PRD merge.

### Out of scope

- Minimum web room, microphone, subtitles (WI-002+).
- Practice themes / server (parking lot).

### Approval

Maintainer confirmed scope on 2026-09-21 (docs + deps + RTCPilot spike; PRD merge; `voice-coach-architecture`). Proceed in Build.

---

## WI-001 recorded focus

- [x] Bootstrap engineering-template files
- [x] Merge PRD / README / architecture / AGENTS
- [x] `npm run docs:verify`
- [x] Record spike + Last session

---

## Parking lot

- Subsequent meeting implementation work is sequenced in the PRD after WI-002 evidence.
- The old coaching join/themes/account queue is superseded by the confirmed meeting scope.
- Recording/replay, translation, accounts and wider deployment remain outside the first release.

---

## Last session

- **GitHub publication (2026-09-26):** The maintainer explicitly requested a public GitHub repository named `caption-meet` and publication of the current project, authorizing the required commit and push for this maintenance task. Created `Hex4C59/caption-meet` and configured `origin`. GitHub rejected the initial push because the local history uses a private email address. Prepare `main` as a new publication history using the account's GitHub noreply address, retaining the original `master` history locally and preserving GitHub email protection. The publication includes current source, vendored dependencies, documentation and baseline fixtures. Excluded the unrelated root agent-warning screenshot while retaining it locally. Removed npm caching from the documentation workflow because this dependency-free root package has no lockfile. Root tests pass 5/5 and the dependency check passes. Documentation verification passes in an exported staged snapshot; the local checkout retains only the previously recorded ignored-skill link failure. Existing whitespace warnings in imported guides and upstream files are preserved. WI-004 remains Build with no gate closure or new media execution.

- **Naming maintenance (2026-09-26):** The maintainer requested a name suited to the confirmed meeting direction. Renamed the product to **CaptionMeet**, package/checkout to `caption-meet`, and the bilingual architecture files to `caption-meet-architecture.*`. Synchronized product references, fixture labels, future certificate subjects, placeholder descriptions and vendor-copy attribution. Decision: `none`; PRD assessment: technical-only naming maintenance. WI-004 remains the sole Build item; no requirement, integration policy or gate status changed.
- **Rename compatibility and verification:** Canonical checkout is `/home/aimsl/code/Cpp/caption-meet`; `voice-coach -> caption-meet` preserves generated absolute paths. Historical build/TLS/evidence files were retained. Existing cache/binary/manifest paths resolve through the alias; fresh trust and legacy-wizard instructions are in [LAN fixture notes](../../scripts/baseline/LAN.md#local-checkout-rename-2026-09-26). Root tests pass 5/5, dependency and changed-script syntax checks pass, and no added whitespace errors were found. `docs:verify` has the same single pre-existing ignored-skill link failure as before the rename, with zero structure errors or new warnings. No services, trust changes, C++ rebuild, commit or push.

- **WI-004 continuation (2026-09-26, 17:46 UTC):** Authorization reaffirmed. The maintainer clarified Ubuntu is a headless SFU server and the other computer is Windows; only one potential interactive browser endpoint is identified. A second real Chrome/camera/microphone computer and same-LAN conditions are missing; real media acceptance remains unverified. Read required context and retained the existing wizard/handoff. Only session state changed; no service, capture or trust operation, repeated media suite, new certificate or duplicate report. Dependency/whitespace checks pass; docs verification retains only the existing skill-link failure. WI-004 stays Build/WIP=1, with no commit/push or gate closure.

- **WI-004 two-device readiness (2026-09-26, 17:36 UTC):** Renewed authorization recorded; current-device question awaits a new answer. Bounded read-only IP/certificate/port/artifact/trust checks completed. No service/trust or media rerun; physical acceptance stays unverified and Build/WIP=1 remains. See the [readiness report](../../docs/reports/2026-09-26-two-device-readiness.md). Resume the existing two-device procedure when same-LAN devices are confirmed.

- **WI-004 physical-device continuation (2026-09-26):** Ubuntu/Windows were confirmed not on the same LAN. Completed fresh TLS/config, dedicated service startup, isolated-trust/security checks, bounded local fake-device media, revised manual wizard and OS-specific handoff. Services/ports and this run's temporary NSS CA cleaned. Physical media and lifecycle acceptance remain unverified; sole active WI stays Build. See the [continuation report](../../docs/reports/2026-09-26-physical-media-handoff.md). Older entries below are history.
- **Current next minimum task:** A second same-LAN physical computer, then execute two-device camera/microphone media observation with per-endpoint original statistics and human confirmation; third device/ten minutes follows. No remote-network/TURN work or new WI is started.

- **WI-004 execution (2026-09-26):** Automatic LAN HTTPS/WSS, media/capture and lifecycle regressions executed; physical two/three-computer acceptance remains unverified because the maintainer's devices are unavailable. WI-004 is the sole active Build item. See its detailed Last session above and the [report](../../docs/reports/2026-09-26-lan-media-baseline.md); earlier entries below are historical.
- **WI-004 next step:** Complete two-computer media and then three-computer ten-minute observation with the prepared fixture/wizard, valid CA and per-device stats plus human listening/video confirmation. No product/gate acceptance from same-machine browsers.

- **WI-002 execution (2026-09-26):** Explicit execution approval recorded; advanced to Build. Fresh RTCPilot Debug build and all three direct timeout tests passed. Pinned/reviewed upstream browser fixture; its production build still fails with 11 TypeScript errors. Two/three independent Chrome processes, signaling-only reconnect, prompt same-ID rejoin, later notification delivery, and 602.362 seconds of six-direction media passed. Fixed reproduced stale publications and response callback binding in two C++ files. Captured actual remote decoded audio, video screenshots/pixel changes and stats. Successful runs released all 26 observed transports, users and rooms; browser resources and experiment ports released. SIGTERM is OS termination, not graceful shutdown. See [report](../../docs/reports/2026-09-26-meeting-baseline.md) ([Chinese](../../docs/reports/2026-09-26-meeting-baseline.zh.md)) and [reproduction](../../scripts/baseline/README.md).
- **Checks and limits:** CTest still registers zero tests. Root tests pass 5/5; dependency check passes. The documentation scanner now excludes generated build output; the pre-existing skill link failure remains, untouched. Earlier failed experiments have three unmatched transport destruction records despite room destruction; no sanitizer or general lifecycle safety claim. Three physical computers, real devices, LAN TLS and weak networks remain unverified. No ASR, paid APIs, product UI, integration-policy change, commits, push, to-tickets or implement.
- **Next minimum task:** Reproduce and close the pre-STUN transport-expiry gap, using `initial-cleanup-audit.json` (25 constructed / 22 observed destroyed) and `WebRtcServer::OnTimer` scanning only the address index as evidence. Add a bounded no-STUN regression with observable registry/handle counts before repair, plus a connected-session control. Keep CTest registration as a separate build-gate gap. No subsequent implementation work was started.


- **Specification verification (2026-09-26):** Documentation structure, dependency check, whitespace check, 13 matching requirement IDs, 20 user stories per language and identical baseline-plan command blocks pass. A second read-only review found no high-impact scope conflict. Full docs verification still fails only on the pre-existing `.agents/skills/setup-ts-deep-modules/SKILL.md` link to `./src/packages/README.md`. Read-only environment preflight found CMake 3.28.3, GCC 13.3.0, zlib 1.3 and bzip2 development files; the proposed build path is ignored. No C++ build, test executable or media service was run.

- **Specification (2026-09-26):** Maintainer confirmed the complete scope ("准确了"). Replaced the old coaching MVP in the bilingual PRD with 20 user stories, 13 requirement IDs, failure/retention acceptance and a testing plan. Added the bilingual WI-002 baseline proposal and aligned product entry points; old architecture assumptions are explicitly superseded, without changing the external VoiceAgent policy. WI-002 is Prepare; WI-001 is retained as previous, unclosed work. No application build, media test, provider activation or feature implementation ran in this documentation session.

- **Scope synthesis (2026-09-26):** Confirmed zero online participants for 60 continuous seconds ends the meeting, clears captions and invalidates its link; recognition skips outage speech and resumes only with new audio; three physical computers are available for final validation. Earlier three-person LAN Chrome audio/video, guest join preview, no host role, interim/final Chinese captions and CNY 30/month recognition budget remain confirmed. Created the [scope draft](../../docs/discussions/2026-09-26-meeting-scope.md) ([Chinese](../../docs/discussions/2026-09-26-meeting-scope.zh.md)) and updated the [interview](../../docs/discussions/2026-09-26-meeting-direction.md) and [vocabulary](../../CONTEXT.md). Next: overall scope review, then a specification and bounded build/interoperability spike proposal. Provider selection, integration-policy suitability, lifecycle details and measured targets remain to be resolved. No application changes, paid service activation, implementation approval or gate closure.

- **Direction interview (2026-09-26):** Maintainer invoked grill-with-docs and selected C++ RTC/server job preparation, applications in March-April 2027, and Chinese small-group discussion. Starting knowledge is C++ and audio/video basics; weekly budget is 10 hours. Camera video is mandatory in the first release, and participants join remotely using individual devices and microphones. Recorded [interview state](../../docs/discussions/2026-09-26-meeting-direction.md) and [initial vocabulary](../../CONTEXT.md). Group size, deployment conditions and caption behavior remain open. This is direction discovery, not approval to implement the meeting product, replace the PRD or close WI-001 gates.

- **Maintenance (2026-09-26):** Maintainer requested ignoring the root `.agents/` directory. Added `/.agents/` to `.gitignore`, preserving existing rules. This does not advance WI-001 or close any gate.
- **Maintenance verification:** `git check-ignore` confirms the directory and its contents are ignored; `git diff --check` and `npm run check:deps` pass. `npm run docs:verify` fails on an existing broken relative link in `.agents/skills/setup-ts-deep-modules/SKILL.md` (`./src/packages/README.md`); the documentation checker still scans Git-ignored files.

- **Date:** 2026-09-21
- **Changes:** Completed progressive reading routes in bilingual AGENTS, documentation index and architecture. Added task-to-section navigation, precise paths, language selection, governance scan/detail rules and safe expansion/stopping criteria. Preserved kernel and generated guides; no new rule files, application/C++ changes or commits. Earlier diagram request remains incorporated.
- **Verify:** `npm run docs:verify` (0 errors/warnings), `npm run check:deps` (passed), `npm test` (5/5 documentation tests); checked the new explicit architecture anchors and target heading anchors. Checks validate documentation structure, not automatic loading behavior. C++ build, sanitizer tests and live VoiceAgent interoperability were not run.
- **Next:** Maintainer reviews Proposed architecture, especially coaching-room scope and ownership boundaries. Before implementation, confirm a focused build/lifecycle spike proposal; do not automatically start UI or close gates.
