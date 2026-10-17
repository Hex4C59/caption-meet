# CaptionMeet - Meeting Product Specification

English | [中文](product-requirements.zh.md)

- Type: Product requirements
- Status: Draft - product scope confirmed; technical defaults and acceptance details proposed
- Created: 2026-09-21
- Updated: 2026-10-14
- Authority: User-visible specification when Accepted; no shipped behavior is implied
- Related: [ACTIVE](../ACTIVE.md), [Glossary](../CONTEXT.md), [Confirmed scope](discussions/2026-09-26-meeting-scope.md), [Architecture](architecture/caption-meet-architecture.md)

The maintainer confirmed the complete scope on 2026-09-26 with "准确了" and authorized
specification preparation and the first technical-validation proposal. This replaces
the old single-person AI coaching MVP. Individual scope choices are confirmed;
new implementation hypotheses below remain proposed. No meeting product is shipped.

On 2026-10-14, the maintainer chose all-Rust maintained code and authorized C/C++ removal as the first step; see [ADR 0002](decisions/0002-rust-source-transition.md). Product scope is unchanged. Rust implementation design and acceptance remain unverified. Historical C++ plans and evidence are indexed separately in the [archive](archive/README.md) and [reports](reports/README.md).

## Problem Statement

People in a small Chinese-speaking group need a browser meeting where they can
see and hear each other and follow captions labeled by participant. Caption
service failures must not interrupt their conversation. The maintainer also needs
a demonstrable project showing Rust RTC server engineering, with reproducible
evidence of protocol work, weak-network behavior and stable resource lifecycles.

## Solution

A three-person meeting on one LAN, using desktop Chrome on independent devices.
Anyone can create/share a meeting link. Guests choose a display name, preview
camera/microphone and join explicitly. All three can transmit audio and video.
Chinese captions appear during the call, support interim revisions and are cleared
when the meeting ends. The empty-meeting grace period is 60 consecutive seconds;
after expiration the old link cannot join or recreate the ended meeting.

The work budget is 10 hours/week, targeting job applications in March-April 2027.
Recognition development/testing has a CNY 30 monthly ceiling. External ASR is
permitted; supplier choice and funding are not completed by this specification.

## User Stories

1. As a meeting creator, I want to create a shareable link, so that others can join.
2. As a participant, I want equal meeting permissions, so that a host is unnecessary.
3. As a guest, I want to enter a display name without an account, so that joining is simple.
4. As a guest, I want to preview my devices before joining, so that I know they work.
5. As a guest, I want an actionable device-permission error, so that I can correct it.
6. As a participant, I want to see and hear two other participants, so that we can discuss together.
7. As a guest, I want a clear meeting-full response, so that I understand why I cannot join.
8. As a participant, I want captions labeled with the correct person, so that I can follow the discussion.
9. As a participant, I want early captions that can be corrected, so that I do not wait for a whole utterance.
10. As a participant, I want confirmed caption text to stay fixed, so that it remains readable.
11. As a participant, I want simultaneous speakers' captions to remain separate, so that text is not overwritten.
12. As a participant, I want calls to continue when ASR fails, so that discussion can proceed.
13. As a participant, I want an unavailable notice, so that I know captions may be missing.
14. As a participant, I want recovery to process new speech, so that old audio does not become a delayed backlog.
15. As a participant, I want a short empty-meeting grace period, so that a temporary absence does not immediately end the meeting.
16. As a guest, I want an expired-link response, so that I know to obtain a new meeting link.
17. As a participant, I want captions cleared after the meeting, so that a transcript is not retained.
18. As a developer, I want recognition spending controlled, so that testing stays within the monthly budget.
19. As a developer, I want repeatable browser and fault tests, so that changes can be verified.
20. As a job candidate, I want measurements and explanations of my own changes, so that I can demonstrate work beyond importing upstream code.

## Requirements and Acceptance

These IDs describe intended behavior, not delivery status. Scope-derived rows are
confirmed; low-level protocol, recovery and measurement details still need validation.

| ID | Requirement | Observable acceptance |
|----|-------------|-----------------------|
| REQ-001 | Any person may create/share a meeting; no host role. | Creator and other participants have the same meeting permissions. |
| REQ-002 | LAN desktop Chrome, display name and device preview before explicit join. | Three independent computers join; no meeting publication occurs during preview. Denied permissions or failed connection show an actionable state. |
| REQ-003 | Three-participant hard cap enforced by the service. | Fourth join and concurrent joins cannot exceed the cap or interrupt existing calls. |
| REQ-004 | Audio and camera video in the first release. | Three participants simultaneously publish and receive the others' microphone/camera media. |
| REQ-005 | Correct per-participant Chinese captions. | Overlapping speech produces independently attributed captions without guessing identity from recognized text. |
| REQ-006 | Interim revisions and fixed final captions. | Revisions update one segment; final text is not silently rewritten. Events cannot update a different participant or an obsolete connection. |
| REQ-007 | Isolate recognition failure from calls. | ASR disconnect/timeout produces an unavailable notice while audio/video remains usable. |
| REQ-008 | Skip outage speech. | Outage audio is not retained for later transcription; recovery processes new speech, with no old-result backlog. |
| REQ-009 | Empty-meeting grace period of 60 continuous seconds. | Valid admission before expiration cancels the empty timer; continuous emptiness for 60 seconds ends the meeting. |
| REQ-010 | Ended meetings reject their old links and clear captions. | Reusing an ended link cannot recreate the room; visible and server-held captions are cleared. |
| REQ-011 | No post-meeting caption retention. | Caption bodies are absent from persistent product/SFU logs and browser storage; provider retention is verified before claiming the full requirement met. |
| REQ-012 | CNY 30/month recognition test budget. | Provider cost model and conservative usage limits are recorded before billable calls; depleted budget disables recognition without stopping calls. |
| REQ-013 | Reproducible engineering evidence. | Multi-browser development checks and a three-computer acceptance run record versions, conditions, behavior and resource/latency measurements. |

## Traceability and implementation status

No meeting product or Rust runtime is delivered. Previous work is historical:

| WI ID | PRD section(s) | Evidence and limits |
|-------|----------------|---------------------|
| WI-001 | *(prior technical baseline)* | Superseded; unresolved documentation/bridge evidence remains in the archive. |
| WI-002 | REQ-002, REQ-004, REQ-013 | C++ build/tests and local browser feasibility only; see the [archived plan](archive/2026-10-14-cpp-meeting-baseline-spike.md). |
| WI-003 | REQ-013 | Focused C++ expiry repair and regression evidence; no product or Rust acceptance. |
| WI-004 | REQ-002, REQ-004, REQ-013 | Automatic trusted-LAN fixture evidence; superseded without physical-device acceptance. |
| WI-005 | *(technical-only)* | Removed C/C++ source and native artifacts; no Rust implementation. |
| WI-006 | *(technical-only)* | Documentation cleanup under ADR 0002; no user-visible behavior or runtime acceptance. |

[ACTIVE](../ACTIVE.md) owns current work and approval. Future implementation must map its user-visible scope to the relevant REQ IDs before Build.

## Implementation decisions

- Use Rust for maintained application code, including browser UI, backend and SFU, under [ADR 0002](decisions/0002-rust-source-transition.md). The old RTCPilot implementation and libuv/CMake choices are retired; retain attribution and historical evidence.
- Browser media uses WebRTC through an SFU. The Rust media library, signaling contract, process layout and framework remain unselected.
- Keep the speech runtime external. Verify recognition-only operation, independent inputs, retention, cost and replacement integration before implementation claims or billable calls.
- Guest display names are presentation labels, not authorization or unique identities. A trusted owner validates meeting/participant identity, admission and capacity.
- Recognition is subordinate to the call. Bounded queues and cancellation prevent a slow recognizer from blocking media forwarding or retaining outage audio; provider credentials stay server-side.
- Meeting end is a product state, distinct from transport cleanup. Old events cannot revive an ended meeting or mutate a replacement connection.

### Details to resolve before implementation

These are design questions, not additional product decisions or existing capabilities:

- Define caption participant/connection identity, segment identity, revisions, finality and ordering from the actual upstream contract.
- Define disconnect detection, reconnect slot ownership, same-name display, link expiration before first join and after restart, and the admission/empty-timer race. Preserve the confirmed cap and 60-second empty-meeting semantics.
- Verify audio format, session limits, provider retention/pricing and a practical budget stop policy; local accounting alone cannot guarantee the provider bill.
- Measure media/resource baselines and distinguish first-caption from final-caption latency before setting numerical service targets.
- Refine proposed acceptance details only where investigation exposes a concrete ambiguity, then update this document and its translation together.

## Testing decisions

Verify the browser meeting flow through real signaling and WebRTC to the Rust SFU. Tests observe user-visible behavior and media through the same interfaces as callers. Keep local multi-browser development results separate from the PRD's three-computer acceptance.

Use a fake external recognition endpoint to emit interim/final, interleaved, delayed, stale and failed events. A separate limited real-service run must verify actual decoding and provider behavior. Verify admission, meeting/participant lifecycle, caption projection, cancellation and failure isolation; use a controllable clock or equivalent deterministic driver for expiry races.

The removed C++ tests and historical reports are reference evidence only. Current root tests validate documentation rules. Rust build, unit/interface tests and runtime verification still need to be established. Record recognition-fake, real-provider, synthetic-browser and physical-device results separately. Weak-network measurements must record the injected loss/delay profile and compare equivalent conditions.

## Out of scope

Accounts, host controls, recording/replay, saved minutes, translation, AI spoken replies, screen sharing, more than three participants, public-internet/mobile acceptance and an embedded speech runtime remain outside the first release.

A Rust SFU is part of the confirmed technical direction. Library selection and implementation scope require their own reviewable work item; this documentation cleanup does not start implementation or close runtime gates.

## Further notes

The [current architecture](architecture/caption-meet-architecture.md) records Rust constraints and unresolved contracts. The [archive](archive/README.md) retains earlier C++/coaching designs and authorization; the [report index](reports/README.md) distinguishes executed C++ results from missing acceptance. Those records do not supply Rust build/media evidence. The PRD remains Draft and the [runtime gates](reference/architecture-gates.md) remain open.
