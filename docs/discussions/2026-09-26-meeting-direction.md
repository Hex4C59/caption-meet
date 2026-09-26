# Meeting Direction Interview

- Type: Discussion
- Status: Scope confirmed on 2026-09-26; carried into the product specification
- Created: 2026-09-26
- Authority: Interview context only; not implementation approval or an accepted PRD

## Confirmed by the maintainer

- Target: C++ audio/video server and RTC roles, emphasizing media forwarding,
  protocols, weak-network behavior and stability.
- Application window: March-April 2027 (the maintainer said next March-April).
- Starting knowledge: C++ basics and audio/video basics. Independent engineering
  experience has not yet been specified.
- Initial use case: Chinese small-group discussion.
- First-release capacity: a hard limit of three participants, with simultaneous audio and camera video. A fourth participant must be told the meeting is full without disrupting those already in it.
- Network scope: separate participant devices on the same LAN; public-internet access is not required for the first release.
- Captions: Chinese live text labeled by participant, with no caption retention after the meeting.
- Supported client: desktop Chrome for the first release.
- Entry flow: open a meeting link, enter a display name, preview the camera and microphone, then explicitly join.
- Recognition deployment: external speech-recognition APIs are allowed; local offline recognition is not a first-release requirement. No provider has been selected.
- Recognition development/test budget: CNY 30 per month (the maintainer answered 30 to the monthly-budget question).
- Caption updates: interim text may be displayed and revised before a confirmed result is fixed. Per-participant updates must not overwrite another participant's captions.
- Recognition failure: show that captions are temporarily unavailable and keep audio/video calls running. Skip speech during the outage without buffering it for later transcription; after recovery, recognize only new speech.
- Meeting creation: anyone may create a meeting and share its link; there is no host role or host-specific permission.
- Meeting end: after zero online participants for 60 continuous seconds, end the meeting, clear captions and make the old link unusable for joining. The grace period allows a temporarily disconnected meeting to be rejoined before expiration.
- Development validation: use multiple browser instances for initial integration; the maintainer can arrange three physical computers for final validation.
- Weekly budget: 10 hours.
- First-release media scope: audio and camera video are both required; the
  maintainer rejected deferring camera video until after the first release.
- Participation model: each person joins remotely using their own device and
  microphone. Shared-microphone speaker identification is not the initial scenario.
- Interview workflow: grill-with-docs, with terminology recorded in
  [CONTEXT.md](../../CONTEXT.md).

## Scope review and remaining work

The [scope draft](2026-09-26-meeting-scope.md) ([Chinese](2026-09-26-meeting-scope.zh.md))
summarizes the confirmed answers and a proposed delivery sequence. The maintainer
confirmed it with "准确了" on 2026-09-26. The [PRD](../product-requirements.md) now
owns specification synthesis; engineering hypotheses remain explicitly proposed.

- Verify the in-tree SFU build, three-person audio/video and recognition interoperability.
- Select a provider after checking budget enforcement, concurrency and retention.
- Measure latency before setting numerical targets or committing calendar estimates.
- Specify same-name display, disconnected-participant detection, reconnect slot
  ownership, and handling of meetings created but never joined.
- Specify finite queues, cancellation, stale events and cleanup; preserve the
  confirmed behavior of skipping audio from recognition outages.
- Align the old coaching PRD/architecture with the meeting scope after overall
  review. The VoiceAgent integration policy remains in force pending any explicit change.

## Source findings (static inspection only)

- Existing audio publishers create a voice bridge bound to room and user identity:
  `third_party/RTCPilot/src/webrtc_room/media_pusher.cpp:84`.
- Recognized text is broadcast using the bound user identity, but the browser
  message does not include a caption segment identifier, interim/final marker or
  the received recognition timestamp: `third_party/RTCPilot/src/webrtc_room/room.cpp:1875`.
- The bridge also handles AI responses and synthesized audio; a recognition-only
  mode and three concurrent recognition sessions remain unverified:
  `third_party/RTCPilot/src/webrtc_room/voice_agent/voice_agent.cpp:145`.
- Existing Info logs include caption text (`room.cpp:1890` and `room.cpp:1901`
  under the path above). Meeting non-retention must address those logs as well as
  the application's state and any selected provider's retention policy.
- These observations do not prove a working three-person call or require a
  particular provider/architecture. No build or live interoperability test ran.

## Room lifecycle findings (static inspection only)

- A join can create a room; the inspected join path does not enforce the selected
  three-participant limit: `third_party/RTCPilot/src/webrtc_room/room_mgr.cpp:184`
  and `third_party/RTCPilot/src/webrtc_room/room.cpp:209`.
- User and empty-room cleanup are timer-based. Resource cleanup is not a defined
  meeting-end or expired-link policy: `third_party/RTCPilot/src/webrtc_room/rtc_user.cpp:38`
  and `third_party/RTCPilot/src/webrtc_room/room_mgr.cpp:119`.
- A reconnect branch uses the same user ID; it does not prove complete media and
  caption recovery: `third_party/RTCPilot/src/webrtc_room/room.cpp:1785`.

## Recognition budget research (2026-09-26; not a provider decision)

Official pricing pages list Tencent real-time large-model 2.0 recognition at
CNY 1/audio-hour and general recognition at CNY 3.2/audio-hour; Alibaba real-time
recognition starts at CNY 3.5/audio-hour for low-volume pay-as-you-go use.
At three continuously streamed tracks, CNY 30 therefore corresponds to roughly
10, 3.125 or 2.86 meeting-hours respectively, excluding rounding, add-ons and
free allowances. Weekly development time is not assumed to be API usage time.

Sources: [Tencent pricing](https://cloud.tencent.cn/document/product/1093/35686),
[Alibaba pricing](https://help.aliyun.com/zh/isi/product-overview/billing-10).

Tencent V2 documents a default 50-stream concurrency limit; Alibaba's trial
allows only two streams, while its commercial default is 200. Account activation,
actual eligibility, funding requirements and retention remain unverified.
Sources: [Tencent V2](https://cloud.tencent.com/document/product/1093/131127),
[Alibaba concurrency](https://help.aliyun.com/zh/isi/product-overview/faq-about-concurrency-and-monitoring).
Both providers document interim and confirmed results. Input format compatibility
still needs a spike; support for Opus does not imply accepting WebRTC RTP packets.
Sources: [Tencent results](https://cloud.tencent.com/document/product/1093/130881),
[Alibaba streaming API](https://help.aliyun.com/zh/isi/developer-reference/api-reference).

No service was opened and no payment or API call was made. Runtime pricing and
account-level constraints must be verified before choosing a provider.

## Proposal status

The three-person room, per-participant live captions, 60-second empty-room expiry,
expired-link rejection, new-speech-only recognition recovery and three-computer
validation are confirmed interview requirements. Recording replay remains outside
this scope. Camera video is required in the first release. The existing coaching
PRD has now been rewritten around the confirmed scope, and the old architecture
has a scope-transition notice. Scope review is complete; no implementation
approval, Accepted ADR or gate closure follows from specification preparation.
