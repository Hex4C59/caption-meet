# Meeting MVP Scope Draft

English | [中文](2026-09-26-meeting-scope.zh.md)

- Type: Discussion
- Status: Scope confirmed on 2026-09-26; engineering proposals remain unverified
- Created: 2026-09-26
- Authority: Summary of interview answers, not an Accepted PRD or implementation approval
- Related: [Interview](2026-09-26-meeting-direction.md), [Vocabulary](../../CONTEXT.md), [Active work](../../ACTIVE.md)

## Purpose

Build a Chinese small-group meeting project to demonstrate C++ RTC server skills:
media forwarding, protocols, weak-network behavior and stability. The maintainer
plans to apply for jobs in March-April 2027, has C++ and audio/video basics, and
can invest 10 hours per week.

## Confirmed scope

| Area | Requirement |
|------|-------------|
| Capacity | Hard maximum of three participants; a fourth sees that the meeting is full without disrupting existing participants. |
| Clients and network | Desktop Chrome, separate devices on the same LAN. |
| Media | Simultaneous microphone audio and camera video from all three participants in the first release. |
| Creation | Anyone may create a meeting and share its link; no host role or host-specific privileges. |
| Joining | Open the link, enter a display name, preview camera and microphone, explicitly join. |
| Captions | Chinese live captions labeled by participant; interim text may be revised, confirmed text stays fixed. |
| Retention | Captions are not saved after the meeting; meeting end clears them. Existing caption-body logs and provider retention must be addressed during implementation/selection. |
| Recognition | External speech-recognition APIs are allowed; no provider has been selected. |
| Recognition budget | CNY 30 per month for development and testing. |
| Recognition failure | Show that captions are unavailable and keep audio/video running. Skip speech from the outage; do not buffer it for later transcription. Resume with new speech. |
| Meeting end | End after zero online participants for 60 continuous seconds, clear captions, and reject the old meeting link. |
| Validation | Multiple browser instances during development; three physical computers are available for final validation. |

Recording replay, translation, AI spoken replies, screen sharing, accounts,
public-internet/mobile support and larger meetings are not part of this confirmed
scope. This is a scope boundary, not a claim that each feature was individually rejected.

## Observable acceptance to put in the specification

1. Three physical computers on the LAN join through the preview flow and exchange
   microphone audio and camera video; a fourth join is rejected.
2. Concurrent speech produces captions attached to the correct participant;
   revisions update the corresponding interim segment, not another person's text.
3. An ASR outage visibly degrades captions while the call continues. Recovery
   never backfills speech from the outage.
4. An empty meeting remains available during its 60-second grace period. If it
   stays empty for the full period it ends, clears captions and rejects the old link.
5. Leaving, rejoining and late ASR results do not resurrect ended meetings, attach
   stale captions to new participants or leave unbounded resources behind.
6. Transcript bodies are absent from persistent application/SFU logs; provider
   retention is verified before claiming end-to-end non-retention.
7. Measure latency, losses, CPU/memory and resource cleanup under documented
   conditions. Set numerical acceptance targets after the first measured baseline.

Items 5-7 translate the goals into proposed engineering acceptance, not measured
results. Reconnect slot ownership, same-name display, detection of a disconnected
participant, and exact latency definitions still need specification.

## Proposed delivery order

1. Reproduce the in-tree SFU build and a browser audio/video call; record dependencies,
   protocol behavior and a first measurement baseline.
2. Deliver the three-person LAN meeting with joining, capacity enforcement,
   participant cleanup, room expiration and expired-link rejection.
3. Add per-participant streaming recognition, interim/final captions, failure
   isolation, non-retention and a budget-control approach.
4. Exercise weak networks, disconnect/rejoin and repeated room lifecycle; collect
   reproducible measurements, regression tests and a demonstration on three computers.

No calendar estimates are committed before the baseline. Record personal changes,
diagnoses and before/after measurements separately from upstream capabilities.

## Technical work still required

- Verify three concurrent media paths and recognition sessions with actual clients.
- Verify interim/final event semantics and audio-format conversion. RTP/Opus is not
  automatically a provider-compatible input stream.
- Choose an ASR provider using official prices, concurrency, activation and retention
  rules. CNY 30 is a budget constraint, not an assertion that a local counter can
  enforce an exact provider bill.
- Determine secure browser access on the LAN, meeting identity/link validation,
  reconnect behavior, finite queues and cancellation/cleanup ownership.
- Reconcile the old coaching PRD and one-human/AI architecture with this direction
  when drafting the specification. Retain the in-tree RTCPilot sourcing decision
  and secret-handling rules.
- The current rules keep VoiceAgent external. Investigate its recognition-only
  suitability; do not silently bypass it or build a replacement AI runtime.
  A necessary integration-policy change must be presented as a concrete decision.

## Next checkpoint

The maintainer confirmed this scope with "准确了" on 2026-09-26. See the resulting
[specification](../product-requirements.md) and [baseline proposal](../plans/meeting-baseline-spike.md).
This file preserves the scope approval record; the PRD owns ongoing specification.
Runtime questions still require executable evidence before implementation tasks and
estimates are finalized. No ADR is Accepted and no existing gate is closed here.
