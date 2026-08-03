# Meeting Domain

Vocabulary for the confirmed Chinese small-group meeting scope.
This glossary defines domain terms; it does not describe shipped behavior.

## Language

**Group discussion**:
A conversation among multiple human participants; the initial language is Chinese.
_Avoid_: AI coaching session, human-agent conversation

**Participant**:
A human joining a remote group discussion using their own device and microphone.
_Avoid_: AI agent, speaker identity inferred from a shared microphone

**Live caption**:
Chinese text representing a participant's speech during the meeting, labeled with
that participant's identity. Captions are not retained after the meeting ends.
_Avoid_: Meeting minutes, saved transcript, AI reply

**Display name**:
The name a participant chooses before joining a meeting and that identifies them
visually in the meeting and its live captions.
_Avoid_: Account name, login name

**Interim caption**:
A live caption for speech still being recognized; its current text can be revised
as more speech is recognized.
_Avoid_: Final caption

**Final caption**:
A live caption whose recognition result is confirmed and no longer revised.
Finality does not imply retention after the meeting.
_Avoid_: Saved transcript

**Meeting creator**:
The person who creates a meeting and obtains its shareable link. Creating a meeting
confers no host privileges over other participants.
_Avoid_: Host, moderator

**Empty-meeting grace period**:
The 60 consecutive seconds during which a meeting has no online participants but
can still be rejoined. If it remains empty for the full period, the meeting ends.
_Avoid_: Meeting duration limit, participant reconnect deadline

**Ended meeting**:
A meeting whose empty-meeting grace period has expired. Its captions are cleared
and its former link can no longer be used to join it.
_Avoid_: Temporarily empty meeting, reusable meeting room
