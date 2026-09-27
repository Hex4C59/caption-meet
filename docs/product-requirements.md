# CaptionMeet - Meeting Product Specification

English | [中文](product-requirements.zh.md)

- Type: Product requirements
- Status: Draft - product scope confirmed; technical defaults and acceptance details proposed
- Created: 2026-09-21
- Updated: 2026-09-26
- Authority: User-visible specification when Accepted; no shipped behavior is implied
- Related: [ACTIVE](../ACTIVE.md), [Glossary](../CONTEXT.md), [Confirmed scope](discussions/2026-09-26-meeting-scope.md), [Baseline proposal](plans/meeting-baseline-spike.md), [Architecture](architecture/caption-meet-architecture.md)

The maintainer confirmed the complete scope on 2026-09-26 with "准确了" and authorized
specification preparation and the first technical-validation proposal. This replaces
the old single-person AI coaching MVP. Individual scope choices are confirmed;
new implementation hypotheses below remain proposed. No meeting product is shipped.

## Problem Statement

People in a small Chinese-speaking group need a browser meeting where they can
see and hear each other and follow captions labeled by participant. Caption
service failures must not interrupt their conversation. The maintainer also needs
a demonstrable project showing C++ RTC server engineering, with reproducible
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

## Traceability to Active Work

| WI ID | PRD section(s) | Acceptance |
|-------|----------------|------------|
| WI-001 | *(none - prior technical baseline, not closed)* | Preserve previous results and unresolved documentation/bridge gates in ACTIVE. |
| WI-002 | REQ-002, REQ-004, REQ-013 (feasibility only) | Clean build/test evidence and browser audio/video interoperability per the baseline proposal; no MVP delivery claim. |
| WI-003 | REQ-013 (technical-only) | Reproduce and repair pre-STUN session expiry; prove index, object and timer reclamation while preserving browser media. No product feature or gate closure. |
| WI-004 | REQ-002, REQ-004, REQ-013 (technical-only) | Trusted LAN HTTPS/WSS fixture and real-device capture path; separate automatic media evidence from two/three-physical-computer acceptance. No product or gate completion claim. |

The remaining requirements are specification scope for subsequent work items,
not a second active build. The local work tracker is ACTIVE plus these requirement
IDs; no external issue has been published.

## Implementation Decisions

- Keep the in-tree RTCPilot SFU and its upstream attribution. Browser media uses
  the SFU; existing signaling compatibility must be verified before changing it.
- Keep VoiceAgent external under the existing integration policy. Determine whether
  its bridge supports recognition-only operation and three independent inputs.
  A different integration strategy requires a concrete decision, not an incidental rewrite.
- Guest display names are presentation labels, not authorization or unique identities.
  Meeting/participant identity and capacity must be validated by the trusted service.
- Recognition is subordinate to the call: finite queues and cancellation must prevent
  a slow recognizer from blocking media forwarding or retaining outage audio.
- Provider keys remain server-side. Existing lifecycle and single-event-loop
  constraints apply; no new browser/server framework or module extraction is selected.
- Meeting end is a product state, distinct from timer-driven transport cleanup.
  Old callbacks must neither revive an ended meeting nor mutate a replacement session.

### Proposed Details for the Baseline to Resolve

These are not additional maintainer decisions or existing capabilities:

- Caption events need participant/connection identity, segment identity, revision/finality
  and a documented ordering rule. Verify upstream fields rather than inventing guarantees.
- Define disconnect detection, reconnect slot ownership, same-name display, link
  expiration before first join and after process restart, and the empty-timer race
  at admission. Preserve the confirmed cap and 60-second empty-meeting semantics.
- Verify audio input format, session limits, provider retention, pricing and a practical
  budget stop policy; local accounting alone does not guarantee the provider bill.
- Define first-caption/final-caption latency separately and measure media/resource
  baselines before setting numeric service targets.
- The proposed user-facing acceptance in the requirements table will be refined only
  where experiments expose a concrete ambiguity, then reflected in the same document.

## Testing Decisions

The primary acceptance boundary is the browser's meeting flow through real signaling
and WebRTC to the SFU. This matches the confirmed multi-browser development and
three-computer acceptance approach; tests observe visible behavior and media,
not private containers or incidental class structure.

Use the existing external recognition connection as the second controlled boundary:
a fake service emits interim/final, interleaved, delayed and failed responses.
It does not synthesize evidence of real audio decoding or actual provider quality.
A limited real-service integration run separately verifies those properties.

Test admission, participant/room lifecycle, caption projection and recognition failure
through these boundaries. Use a controllable clock or equivalent deterministic
driver for expiration races; tests should not sleep for a minute to prove a timer.

Existing tests exercise TCC packet handling, timers and the protoo connection.
They provide useful fixtures but not meeting acceptance. They rely on assertions,
so run them in Debug; direct execution is required until CTest registration exists.
Current root tests validate documentation, not audio/video.

Record the distinction between passing an ASR fake, passing a real provider,
multi-browser results and three-device results. For weak-network work, record the
injected loss/delay profile and compare equivalent before/after runs. No numerical
performance result has been produced in this specification session.

## Out of Scope

Accounts, host controls, recording/replay, saved minutes, translation, AI spoken
replies, screen sharing, more than three participants, public-internet/mobile
acceptance, a new SFU or an embedded VoiceAgent runtime. No mass refactor, service
fleet, automatic provider activation, commit or gate closure is implied.

## Further Notes

The [current architecture](architecture/caption-meet-architecture.md) separates
applicable constraints, unresolved meeting design and the
[historical coaching proposal](archive/2026-09-26-coaching-architecture.md).
Its module design and contracts remain Proposed/Outline; the old single-human/AI
assumptions are superseded by the confirmed meeting scope.
The baseline proposal owns evidence gathering before implementation tickets and
calendar estimates are finalized. The [executed baseline](reports/2026-09-26-meeting-baseline.md)
now establishes Debug build and local browser media evidence. Remaining gaps include
CTest registration, physical-device acceptance, absent product UI, ASR transcript-body logs, and unverified
three-stream recognition. Keep the named gates open until their actual closure criteria
are met. The previous scope summary remains the approval record, not a second PRD.
