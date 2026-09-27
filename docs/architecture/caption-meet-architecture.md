# CaptionMeet architecture

English | [中文](caption-meet-architecture.zh.md)

- Type: Architecture
- Status: Proposed
- Updated: 2026-09-26
- Authority: proposed module boundaries, dependency rules, contracts and resource ownership; not implementation approval
- Related: [PRD](../product-requirements.md), [gates](../reference/architecture-gates.md), [ADR 0001](../decisions/0001-vendor-rtcpilot-in-tree.md), [governance](../guides/architecture-governance.md)

> **Current applicability (2026-09-26):** This document retains the constraints applicable to the confirmed three-person LAN meeting scope and explicitly marks unresolved meeting design. Modules remain Planned/Proposed and contracts remain Outline. The complete [historical coaching design](../archive/2026-09-26-coaching-architecture.md) preserves the superseded Practice APIs, single-human workflow and AI spoken-reply path; consult it only for design history or legacy compatibility. The [PRD](../product-requirements.md) owns product scope; [ACTIVE](../../ACTIVE.md) owns the sole current WI and execution conditions. Evidence already obtained in WI-002–WI-004 is summarized in §2.

<a id="task-reading-guide"></a>

## Task reading guide

This is the single task-to-section routing index; AGENTS and the documentation index link here rather than duplicate it. Keep existing section numbers stable. Read the selected sections using headings/search and bounded file reads; a link does not require loading the whole document.

For architecture-impacting work, first read §1 (status/scope), §3 (identities) and §6 (dependency invariants). Then select routes below, cumulatively when tasks overlap. Pure copy/translation changes need the affected passage and bilingual policy, not every architecture route.

- **Browser meeting flow:** §4.1–4.3, C-01/C-02/C-06, browser ownership in §8 and relevant states/cleanup in §9. For user-visible work also read the PRD; do not infer acceptance from this proposal.
- **Business service / admission:** §4.4, §5.3–5.4, C-01/C-02/C-06, §8–10; consult `gate-session-admission` before non-local deployment.
- **Session cleanup / reconnect / shutdown:** §5.1, §5.5–5.6, C-02/C-05/C-06, §8–9; use §11 lifecycle tests and `gate-sfu-lifecycle`.
- **RTP / RTCP / forwarding / buffer ownership:** §5.6–5.7, C-03/C-05, §8–10, media acceptance in §11; consult `gate-media-capacity`.
- **VoiceAgent / recognition suitability / legacy AI output:** §5.8–5.10, C-03–C-06, §8–10 and voice tests in §11; also read the in-tree configuration guide's `voice_agent` section and affected bridge source. Consult `gate-voice-agent-bridge`.
- **Signaling / WHIP / room commands:** §5.2–5.5, C-02/C-05/C-06, §8–10 and WHIP regression acceptance in §11; consult signaling and admission gates.
- **Cluster / legacy streaming:** §5.11 plus the touched room, transport or routing modules; C-03/C-05/C-06 and §8–10. Follow actual caller/callee evidence; the single-node proposal is not cluster certification.
- **New public interface / module extraction:** affected §4/§5 modules, §6, matching C-01–C-06, §8–9, and §10 if trust, queues or persistence change. Read consumers and boundary tests, not just the new interface.
- **Build / dependency / upstream upgrade:** §2, §6, §11–12, [ADR 0001](../decisions/0001-vendor-rtcpilot-in-tree.md), relevant CMake/configuration and tests; consult build/boundary gates.

For architecture changes, scan the [governance dimension index](../guides/architecture-governance.md#index-dimensions-at-a-glance) and checklist headings before selecting detailed dimensions. Lifecycle work normally requires ownership, concurrency, errors, cleanup and tests; API work requires interfaces, dependencies, contracts and compatibility; security/persistence changes add the corresponding dimensions. Report applicable pass/gap/N/A with evidence. Do not edit the generated governance guide to duplicate product routes.

Expand reading when a contract references another invariant, ownership crosses modules, callbacks outlive a caller, or source disagrees with this Proposed design. Consult §2/§12 for evidence/gaps and the [gate register](../reference/architecture-gates.md) for affected gates. Stop when affected producers, consumers, owners, failure paths and tests are covered. These routes never waive kernel/collaboration requirements or turn Outline contracts into Living ones.

## 1. Decision and scope

The retained direction is a **modular C++ SFU monolith**, a planned browser client, an optional thin business service, and external VoiceAgent integration through RTCPilot. Keep RTCPilot development in `third_party/RTCPilot`; do not restore a sibling-checkout requirement. Retain upstream licenses and provenance. Recognition-only suitability remains unverified; a different integration strategy requires an explicit decision.

Internal module boundaries are compile-time and ownership boundaries, not new network services. Start with the existing single libuv event loop. Do not introduce a generic event bus, service locator, microservice fleet, shared mutable session store, or a second ASR/LLM/TTS implementation.

The browser/server language and framework are **not selected** by this proposal. Node documentation scripts do not select the product stack. TypeScript guidance applies only if TypeScript is later adopted. C++17 is the current SFU build baseline.

**Maturity:** design direction with **Outline** contracts. None of the proposed module APIs are Living or implemented merely because they appear here. The PRD remains Draft. ADR 0001 accepts only the in-tree sourcing decision, not this redesign, production security, or functional readiness.

### 1.1 Target architecture overview (Proposed)

| Boundary | Current applicability | Unresolved meeting design |
|----------|-----------------------|---------------------------|
| Browser — `apps/web` | Planned presentation, application coordination and realtime adapter; no provider secrets | Device preview/join flow, application API and caption projection |
| Trusted product control — optional `server` | Planned; media bypasses it; SFU must validate admission | Whether a separate service is needed; meeting/link authority, cap and empty-timer coordination |
| SFU — `third_party/RTCPilot` | In-tree implementation with measured baseline results (§2); proposed internal seams in §5 | Module extraction, admission enforcement and complete lifecycle guarantees |
| VoiceAgent — external via RTCPilot bridge | Existing integration policy; no embedded ASR/LLM/TTS implementation | Three independent inputs, recognition-only operation, interim/final semantics and failure isolation |

Browser media uses the SFU, not a peer-to-peer bypass or business-service relay. No edge in this overview specifies a new API, implemented owner or selected web/server framework. Meeting creation, admission and captions need their own contracts before implementation. The [old diagram](../archive/2026-09-26-coaching-architecture.md#11-target-architecture-overview-proposed) describes the superseded coaching/AI output proposal, not the meeting target.

## 2. Evidence and current gaps

The following paths are relative to `third_party/RTCPilot/`:

- `src/RTCPilot.cpp`: composition root using `uv_default_loop()`, network listeners and optional cluster/legacy streaming services. No complete ordered application drain is established in this main path.
- `src/ws_message/ws_message_session.cpp` and `src/webrtc_room/room_mgr.cpp`: JSON/protoo dispatch, including `join`, `push`, `pull`, `heartbeat`, and `textMessage`.
- `src/webrtc_room/room.hpp` / `room.cpp`: `Room` combines membership, SDP, packet routing, cluster callbacks, voice text and AI RTP publication. This is the principal decomposition seam.
- `src/webrtc_room/webrtc_server.cpp`: static username/address registries still hold sessions. WI-003 reproduced and repaired the address-only inactivity-expiry scan: expiry now considers the username registry and removes all matching indexes. This focused repair does not implement the sole-owner registry in §5.5 or establish room-wide cleanup safety; `RemoveSessionByRoomId` remains an explicitly unverified path in the [WI-003 report](../reports/2026-09-26-pre-stun-expiry.md#change-boundary).
- `src/webrtc_room/webrtc_session.*`, `media_pusher.cpp`, `media_puller.hpp`: transport/security and track resources have overlapping shared ownership and borrowed callback pointers.
- `src/webrtc_room/voice_agent/voice_agent.cpp`: external JSON/WebSocket adapter; an audio pusher creates a bridge. AI output is currently coordinated by room-wide state. Conversation IDs are narrowed to integers, which is not a safe general identifier contract.
- `src/net/udp/udp_pub.hpp`, `src/utils/timer.cpp`, `src/webrtc_room/pilot_message_client.*`: pending I/O, timer and request callbacks need explicit cancellation/lifetime guarantees.
- `CMakeLists.txt`: one broad executable source list and broad include visibility, not enforced module targets. `tests/` includes TCC, timer, protoo and the focused `webrtc_session_expiry_test`; CTest still discovers zero tests in the recorded runs.

The structural findings above are retained inspection evidence; the following reports establish narrower executed results:

| Evidence | Established | Limits |
|----------|-------------|--------|
| [WI-002 baseline](../reports/2026-09-26-meeting-baseline.md) | Fresh Debug build and three direct tests; repaired same-ID publication/reply-callback behavior; 602.362-second synthetic three-browser, six-direction media run | Same-machine browsers; pinned upstream client production build still has 11 TypeScript errors; no graceful shutdown claim |
| [WI-003 expiry](../reports/2026-09-26-pre-stun-expiry.md) | Pre-STUN failure reproduced then repaired; indexes, tracked objects and timers reclaimed; targeted ASan/UBSan regression and browser controls pass | Focused paths only; not a whole-SFU ownership, leak or shutdown audit |
| [WI-004 LAN baseline](../reports/2026-09-26-lan-media-baseline.md) and [continuation](../reports/2026-09-26-physical-media-handoff.md) | Normal HTTPS/WSS trust, static/private-file boundaries, local synthetic/fake-device media and capture-state checks | Real cross-computer media, hardware and human observations remain unverified |
| [WI-004 readiness](../reports/2026-09-26-two-device-readiness.md) | Read-only artifact, port and TLS recheck; existing fixture/handoff retained | No physical acceptance; current device conditions and next step live in [ACTIVE](../../ACTIVE.md) |

`apps/web` and `server` remain placeholders; the baseline browser fixture is not a product UI. No report verifies captions, real VoiceAgent interoperability, weak-network behavior or full meeting acceptance. Executed evidence does not close gates without their recorded acceptance process. Documentation checks are separate from media evidence.

## 3. Domain identities and invariants

- Product meeting identity, join-link validity and SFU room lifetime are distinct concepts. Their mapping and authoritative owner remain unresolved (C-01); the historical `PracticeSessionId` and its service ownership are not a meeting API.
- `RoomId`: SFU membership and routing scope. `ParticipantId`: admitted identity within that scope; never trust a browser-provided ID as authorization.
- `TransportId`: one negotiated WebRTC transport. `PublicationId`: one published media track. `SubscriptionId`: one receiver's subscription. Transport SSRCs are not durable publication identities.
- `Generation`: monotonically increasing local incarnation of a participant connection. Reconnect creates a new generation; old callbacks cannot mutate the replacement.
- Bridge identifiers, where supplied: `ConversationId` remains an opaque upstream string, never `atoi()`-converted. Historical `TurnId` and `EventSequence` are local correlation proposals, not upstream guarantees or a defined caption segment/revision schema (C-04).

All cross-session handles carry scope and generation. A lookup failure or stale generation is a normal rejected operation, not permission to recreate a room. A publication belongs to exactly one participant; a subscription belongs to exactly one receiver; neither owns its transport.

**Superseded coaching assumption:** one human and one AI conversation per room was the earlier product proposal. The confirmed meeting scope now requires a hard maximum of three human participants and independent captions, with no AI spoken replies. This does not prove that the current bridge already supports recognition-only meetings; that integration remains to be verified.

## 4. Product-side modules (Planned)

<a id="41-practice-ui--appsweb-presentation"></a>

### 4.1 Browser presentation — `apps/web` (Planned)

Retained responsibility: rendering, user intent and transient view state through an application boundary. It must not parse protoo messages, retain provider secrets, administer SFU rooms, or treat displayed captions as durable truth. The actual meeting UI API is unresolved; the [Practice UI](../archive/2026-09-26-coaching-architecture.md#41-practice-ui--appsweb-presentation) is historical.

<a id="42-practice-controller--appsweb-application"></a>

### 4.2 Browser application coordination — `apps/web` (Planned)

Retained responsibility: local lifecycle coordination and disposable event subscriptions, depending on narrow business/realtime ports. It does not own DOM nodes or WebRTC objects. Resource acquisition must be compensated on failed start, duplicate/illegal operations must have explicit outcomes, and local leave/cleanup must be idempotent.

The [old practice operations and state list](../archive/2026-09-26-coaching-architecture.md#42-practice-controller--appsweb-application) are superseded, not renamed meeting APIs. Meeting preview/admission, reconnect, caption projection and end-state transitions remain to be defined against the PRD and C-01/C-04.

### 4.3 Realtime client — `apps/web`, browser adapter

Proposed owner of browser `MediaStream`, capture tracks, `RTCPeerConnection`, signaling socket, playback bindings and reconnect timers. Only this boundary understands browser WebRTC and RTCPilot wire formats; it translates protocol DTOs into application events and cannot mint membership permissions.

Disconnect must stop owned tracks, remove listeners, close peer/socket resources and release playback. Audio-only `publishMicrophone()` and the [old operation list](../archive/2026-09-26-coaching-architecture.md#43-realtime-client--appsweb-browser-adapter) do not define the required camera/preview lifecycle. The experimental capture fixture supplies evidence (§2), not an implemented product adapter or approved meeting API.

<a id="44-practice-service--server-optional-trusted-control-plane"></a>

### 4.4 Trusted product control — `server` (optional, Planned)

Whether meeting/link state and admission coordination need this separate service remains unresolved. The [practice service](../archive/2026-09-26-coaching-architecture.md#44-practice-service--server-optional-trusted-control-plane), theme lookup and `createPractice` operations are historical; they do not establish meeting ownership or endpoints.

Retain the trust constraints: derive caller identity from validated context, never a browser assertion. If a join descriptor is used, it contains only a permitted signaling endpoint, room/participant scope, expiry and scoped admission credential; never provider credentials or an arbitrary browser-supplied upstream URL. A corresponding SFU verifier must exist; issuing a token alone provides no enforcement. Any future remote teardown uses an authenticated control boundary or bounded expiry, not shared room-map mutation.

No database is required for the current fixture. The explicitly authorized trusted-LAN fixture uses fixed configuration without verified membership authorization; it is not an authenticated or production deployment. Meeting cap, link invalidation and the 60-second empty timer still require a product contract and owner (C-01).

## 5. SFU module boundaries (Proposed)

All proposed SFU modules stay under `third_party/RTCPilot`. Names below are logical modules and future target names, not claims that directories already exist. Sections 5.1–5.7 retain the proposed control/media seams; §5.8–5.10 distinguish bridge constraints from the superseded coaching output design. Any extraction needs its own scope approval and preserves the executable entry point.

### 5.1 Runtime composition — `runtime`

Owns the event loop, validated immutable configuration, listeners, module instances and shutdown coordinator. Constructs concrete adapters and injects dependencies. Public lifecycle: `start(config)` and `stop(deadline)`.

Only this module knows all concrete implementations. It has no room policy, SDP manipulation or per-packet routing logic. Separate read-only configuration slices go to consumers; do not inject the global configuration singleton everywhere.

### 5.2 Signaling ingress — `signaling`

Owns WebSocket/HTTP protocol parsing, connection correlation, response serialization and ingress size/rate limits. Calls room-control commands after admission validation; receives typed results/events through a connection-scoped sink.

Protoo and WHIP are separate adapters over the same use cases. They do not write room maps or own media sessions. A WHIP resource identifies one publication; deleting it cannot delete unrelated participants or the whole room.

### 5.3 Admission — `admission`

Implements `authorizeJoin(credential, requestedScope, now)` and returns an immutable `AdmissionGrant` or an error. The grant specifies participant, room, publish/subscribe permissions and expiry. Other commands validate the connection's bound grant and generation.

Owns verification key material and replay/expiry policy; not room resources or product accounts. Verification fails closed outside explicit local development mode. This is a security gate, not a currently verified RTCPilot feature.

### 5.4 Room control — `room_control`

Owns membership, publication/subscription metadata and room state. Public operations: `join`, `publish`, `subscribe`, `leave`, `heartbeat`, `snapshot`. Each accepts a typed command and validated context, not arbitrary JSON/method strings.

Orchestrates session, routing and voice ports. Owns logical room handles, not sockets, RTP packet queues, SDP parser internals or VoiceAgent WebSocket clients. It handles typed completion events; callbacks do not include mutable `Room*` references.

### 5.5 Session registry — `session_registry`

Is the **sole lifetime owner** of WebRTC sessions, indexed by opaque handles. Operations: `createTransport`, `negotiate`, `findTransport`, `closeTransport`, `closeParticipant`, `closeRoom`.

Username/address tables are non-owning indexes into the primary transport registry, not independent `shared_ptr` owners. Registration begins before STUN, with an explicit negotiation deadline. Closing a transport removes every index and blocks new operations before draining pending work.

Room control owns intent; the registry owns actual transport lifetime. `closeRoom` does not erase the room: it returns a completion after its transports drain, and room control then removes membership.

### 5.6 RTC transport — `rtc_transport`

Owns ICE/DTLS/SRTP, negotiated SDP state, receive/send track engines and network request scopes for one session. Implements negotiation, protected send and close; emits transport-ready/failed/closed and validated media callbacks.

Does not know product prompts, room membership storage, cluster routing or VoiceAgent JSON. Share the UDP listener at runtime level; a transport owns its registrations and pending operations, not the listener itself.

### 5.7 Media routing — `media_router`

Owns publication-to-subscriber route metadata, not sessions. Operations: `attachPublication`, `attachSubscription`, `detachPublication`, `detachSubscription`, `forwardPacket`.

Depends on narrow packet-source/sink ports. Existing `MediaPusher` receive and `MediaPuller` send engines remain transport-owned; routing holds non-owning generation-checked endpoint handles. Route mutation is serialized on the media loop. Room control removes routes before destroying transport endpoints.

No JSON, persistence, business queries or AI network requests in the packet-forwarding path. RTCP feedback is routed through transport capabilities, not arbitrary access to another session's internals.

<a id="58-voice-session--voice_session"></a>

### 5.8 Voice session — meeting adaptation unresolved

The [coaching voice-session design](../archive/2026-09-26-coaching-architecture.md#58-voice-session--voice_session) combined conversation, text sequence and AI output ownership. That bundle is historical. It does not define a meeting recognition owner or require an AI publisher for captions.

Retain participant-scoped binding (room, participant, source publication, generation), cancellation and stale-event rejection. A participant disconnect must cancel only its bound work; recognition failure must not interrupt the call. Do not implement ASR/LLM/TTS inside this repo. Three independent inputs, caption ordering/finality and the actual recognition lifecycle need bridge evidence and a contract before this module can be adapted (C-04).

### 5.9 VoiceAgent adapter — `voice_adapter`

Retained proposed seam: own the external WebSocket, codec/protocol conversion, jitter-buffer resources, heartbeat and bounded reconnect; expose typed events instead of provider JSON. It must not create virtual room users or mutate room maps. Protocol upgrades belong here and in fixture tests, not spread across UI and packet routing.

The existing bridge maps `input_audio_buffer.append`, `input.transcript`, `response.text`, `conversation.start`, `conversation.end` and `tts_opus_data`. These protocol messages do not establish recognition-only mode, interim/final captions, cancellation or replay guarantees. The [historical interface](../archive/2026-09-26-coaching-architecture.md#59-voiceagent-adapter--voice_adapter) includes reply/output events that are not meeting requirements. Keep the external integration policy while verifying the recognition subset.

<a id="510-ai-publisher--ai_publisher"></a>

### 5.10 AI publisher — historical compatibility only

AI spoken replies are outside the meeting scope. The [AI publisher proposal](../archive/2026-09-26-coaching-architecture.md#510-ai-publisher--ai_publisher) preserves its virtual publication, queue, RTP, unique stream identifiers, codec validation and pacing design for historical/legacy work; it is not a required meeting module or implementation task.

Existing upstream AI output must not be incidentally removed during unrelated extraction. If that path is touched, retain its single frame/timer owner, ordinary publication port, bounded queues and cancellation rules (C-03/C-05 and §8–9); do not infer that a local discard cancels upstream synthesis.

### 5.11 Optional adapters — cluster and legacy streaming

Cluster discovery/control depends on cancellable room-control ports; relay transport implements packet source/sink ports. Neither can bypass admission or directly change private room maps. Cluster clients own pending request records; room scopes own cancellation handles.

RTMP/HTTP-FLV/WebSocket-FLV remain optional edge adapters outside the initial meeting scope. Preserve existing capabilities during extraction; do not redesign or remove them incidentally. Inter-node encryption and authorization are unverified; single-node acceptance does not certify cluster deployment.

## 6. Dependency rules and enforcement

1. UI depends on an application boundary; application coordination depends on business/realtime ports; concrete browser/network adapters implement those ports. The composition root wires them. Meeting operation names and product-state ownership remain unresolved in §4/C-01.
2. Signaling depends on admission and room-control public contracts. Room control depends on session/routing/voice **ports**, not concrete WebSocket, HTTP or provider implementations.
3. Registry depends on RTC transport. Transport depends on RTP/RTCP, SDP, crypto and network primitives, never room control. Router depends on media value types and endpoint ports, never concrete `WebRtcSession` ownership.
4. The voice adapter depends on external protocol/network primitives. In the historical coaching split, voice session depends on adapter/publisher ports and publisher on media publication and clock/scheduler ports; preserve that direction when maintaining legacy output, without making a publisher part of meeting recognition. No mutual implementation-header imports.
5. Reverse runtime notifications use injected typed sinks defined at the consumer boundary. Callback flow is not permission for reverse implementation includes or circular ownership.
6. Define a DTO once beside its owning public contract. Cross-language wire schemas are language-neutral and versioned; do not create a large `shared` package just to exchange a few fields. Private parser/library types (`json`, `uv_*`, mutable SDP objects) stay behind adapters.
7. Proposed CMake targets expose only explicit public include directories and declared link dependencies. No recursive global include list for new modules. Add compile-only consumer tests and forbidden-include checks; until these exist, boundary enforcement is a gap.
8. Do not add generic `invoke(method, payload)`, mutable-map getters, global service lookup or interfaces exposing every implementation method. Public API growth requires a named consumer, contract update and test.

## 7. Contract catalog (all Outline)

The following IDs are stable review anchors in this file. They become Living only with corresponding implementation, boundary tests and confirmed scope. C-01 and C-04 explicitly require meeting adaptation; C-02/C-03/C-05/C-06 retain applicable constraints. Operation names are semantic proposals, not published C++ ABI or HTTP endpoints.

<a id="c-01-practice-lifecycle"></a>

### C-01 Product lifecycle — meeting contract unresolved

The [practice lifecycle contract](../archive/2026-09-26-coaching-architecture.md#c-01-practice-lifecycle) is historical. Its theme validation, Practice IDs and practice-service ownership are not a meeting contract. Meeting creation/link authority, cap enforcement, reconnect slot ownership and the atomic relationship between admission and the 60-second empty timer remain unresolved; no owner or endpoint is selected here.

Retain the applicable operation constraints: mutating calls need bounded deduplication and explicit conflict behavior; repeated end/cleanup must be idempotent. A remote timeout means an **unknown outcome**, not guaranteed rollback; define a query/reconciliation path before allowing retry of creation. Product-ended and SFU-drained remain separate facts; remote teardown cannot mutate shared memory across processes.

The PRD requires ended links to reject admission without recreating the meeting and captions to be cleared at end. Current SFU inactivity/empty-room timers do not implement those product semantics. Process-restart behavior, link expiry before first join and the caption-state owner still need a decision.

### C-02 Room commands and snapshots

Owner: room control; signaling translates the wire. Common context: request ID, room ID, participant ID, generation, admission grant and deadline. Publish carries a bounded SDP offer; subscribe carries the target publication and receiver's offer. Results contain only operation-specific IDs/answer and state, not internal pointers.

Join requires an open room and admitted scope. Publish/subscribe require active membership and permissions; subscribe also requires a live target publication. Success installs metadata only after required transport/routes are ready to own; partial failure compensates allocations. Repeated leave succeeds; heartbeat cannot resurrect closed membership. Dedupe mutating requests per identity/generation/request ID with bounded storage; do not assume the existing protocol already provides this.

An SDP answer means negotiation was accepted, **not** ICE/DTLS connectivity. Transport readiness is a separate event. No automatic retry of non-idempotent publish with a fresh request ID. Reconnect obtains a new generation and full snapshot; no guaranteed event replay. Snapshot and subsequent subscription must have a common sequence barrier to avoid a race between them.

### C-03 Media buffer transfer

Owner: allocator/producing transport until transfer. A synchronous packet callback borrows an immutable packet view valid only until return. A queue accepts unique ownership or an immutable ref-counted buffer; it never retains a borrowed pointer. Forwarding borrows the input; each asynchronous output explicitly retains or copies its buffer and releases on send completion/cancel.

Each queue specifies maximum bytes, packets and age. Queue overflow returns `Backpressure` or applies an explicit real-time drop policy with a metric; no silent unbounded accumulation. Codec-inappropriate packet dropping is forbidden. Media statistics track gaps; packet delivery is not exactly-once or lossless.

<a id="c-04-voice-events-and-ai-output"></a>

### C-04 Voice correlation — caption contract unresolved

Retain scoped correlation by room, participant, source publication and connection generation; preserve opaque upstream IDs only where actually supplied. Reject unattributable or stale events instead of guessing the speaker. Local sequences/turn IDs are local metadata, not provider guarantees. The meeting recognition/caption-state owner and event schema remain unresolved.

Ordering is per connection/generation, with no assumed total ordering between bridges or replay guarantee. Reconnect invalidates the old recognition scope and must not resend outage audio. Transcript text without verified finality must not be promoted to a final caption. The PRD requires revisable interim captions, fixed final captions and per-participant isolation; segment identity, ordering and upstream-field mapping remain proposed details to define and verify before implementation.

Verify input codec, clock, channels and frame duration with fixtures and interoperability; unsupported parameters fail explicitly. The [old output contract](../archive/2026-09-26-coaching-architecture.md#c-04-voice-events-and-ai-output), Opus/48 kHz/20 ms hypothesis, turn-end versus playback-drain distinction and `discardTurn` semantics apply to legacy AI output, not meeting captions. Local discard is not proof of upstream cancellation; recognition-only suitability remains behind the voice bridge gate.

### C-05 Cancellation and close

Owner: the resource's creating module. Every asynchronous command has a request scope, monotonic deadline and generation. Its completion occurs once on the owning loop: success, error or cancellation. Timeout stops waiting and cancels local scope; it cannot claim a remote side effect was undone.

Close is idempotent and enters closing before detaching ingress. It rejects new work, invalidates callbacks, cancels timers/requests, drains outstanding network completions, then acknowledges closed. Late completions release buffers without accessing destroyed owners. A raw pointer captured by a pending UDP send is not a valid cancellation strategy. Closing from a callback must defer destruction until that callback unwinds.

### C-06 Error and compatibility envelope

Boundary errors use a stable code, safe message, request correlation and retry classification. Proposed codes: `InvalidArgument`, `Unauthorized`, `Forbidden`, `NotFound`, `InvalidState`, `Conflict`, `StaleGeneration`, `DeadlineExceeded`, `Cancelled`, `Backpressure`, `UpstreamUnavailable`, `UnsupportedCodec`, `ProtocolMismatch`, `Internal`.

Never include secrets, full SDP, raw provider messages or audio in public errors. The adapter maps codes to legacy wire responses; do not rename existing protoo methods/events incidentally. Existing local events include `userLeave` and `userDisconnect`; documentation naming alone does not establish `userLeft` compatibility.

Product-owned network contracts carry a major version and reject incompatible majors. Adding internal types does not version the external VoiceAgent protocol. For every breaking wire change, pin peer versions, supply compatibility tests and record the rollout decision before deployment.

## 8. Ownership and lifetime rules

These are proposed ownership constraints, not a description of completed module extraction. WI-003 repairs one existing expiry path without establishing the ownership model below.

- Runtime owns listeners, loop, module instances and crypto/log infrastructure. Listeners are not owned by a room.
- Room control owns rooms, members and logical publication/subscription records. Other modules retain opaque handles, not owning room pointers.
- Session registry alone owns transports. Username/address lookups are indexes. A transport owns DTLS/SRTP, track engines and pending network scopes.
- Media router owns routes only. A route cannot extend transport lifetime or resurrect a closed endpoint.
- For the historical coaching/legacy output design only: room control owns the voice-session collection; each voice session uniquely owns its adapter and AI publisher, which owns every output frame and pacing task. Meeting recognition and caption-state ownership must be resolved separately (§5.8/C-04), without dual writers.
- Each network adapter owns its pending request map. The initiating room/voice scope holds cancellable handles, not the request map itself.
- Each observer registration returns a disposal token owned by the subscriber. The publisher must not invoke a disposed observer.
- Browser realtime adapter owns device/network resources. External VoiceAgent owns model/provider runtime state. Historical practice-service metadata ownership does not assign meeting/link state; that owner remains unresolved (C-01). No shared writer spans these domains.

Prefer `unique_ptr` for lifetime ownership. Use `shared_ptr` only for genuinely shared immutable buffers or documented completion state, not as a substitute for a lifetime design. Borrowed references require a shorter synchronous lifetime; asynchronous work uses generation-checked handles or weak cancellation state. Every raw pointer in a public seam must state borrow/transfer semantics.

## 9. Concurrency, state and shutdown

All room, session-index, route and voice-session mutations stay on their owning libuv loop. Do not block that loop with filesystem/database calls, model work, slow logging or waits. Future worker jobs receive immutable data and post completion with generation checks; workers cannot mutate room maps. Do not add a mutex and claim the subsystem became thread-safe.

Proposed SFU states: room open, draining, closed; transport negotiating, connecting, connected, closing, closed (failure enters closing with a recorded reason). These are not the product meeting state machine. The historical coaching voice state list is preserved in the [snapshot](../archive/2026-09-26-coaching-architecture.md#9-concurrency-state-and-shutdown); meeting recognition transitions need C-04 adaptation. Stopped instances are not reused; replacement creates a new generation. Invalid transitions produce `InvalidState` or a documented idempotent no-op.

Proposed participant cleanup: stop its ingress/admission context; invalidate generation; cancel its bound voice work and remove its publication/subscription routes; cancel requests in that participant's scope; close its transports; drain callbacks; remove participant metadata. Other participants remain unaffected. An empty SFU room with no pending work is a resource-cleanup condition, not permission to bypass the PRD's 60-second empty-meeting grace period. The coordination with product end, link invalidation and caption clearing is unresolved (C-01).

Proposed process shutdown order (not established by the recorded SIGTERM tests):

1. Stop accepting new signaling/HTTP work and mark rooms draining.
2. Stop voice ingress/retries, cancel cluster/control requests and detach route producers.
3. Clear owned voice queues; for enabled legacy AI output also cancel its pacing. Cancel room timers and close sessions/protocol clients.
4. Drain pending send/close callbacks while loop, crypto and logs remain alive. Enforce a bounded shutdown deadline and report forced termination.
5. Close remaining listeners and timer handles; verify no unexpected active handles, then close the loop.
6. Destroy crypto only after all transport users are gone; flush/join log workers last.

Crash cleanup cannot promise graceful acknowledgements. In-memory session state is lost on restart; clients must not assume a resumed connection. Meeting-link/restart semantics remain unresolved under C-01; this does not authorize persisting captions or introducing practice storage.

## 10. Security, capacity and privacy

TLS does not provide membership authorization. Validate credentials at SFU ingress and permissions on publish/subscribe; reject room/user impersonation. Rate-limit join, SDP and text requests; constrain payload sizes before parsing/allocation. Provider endpoints and key paths are trusted deployment configuration, not browser-controlled input.

VoiceAgent transport security is an open item: the inspected bridge creates a non-TLS connection. Restrict deployment to an explicitly trusted local/private boundary until TLS or a secured transport is verified. Cluster UDP confidentiality cannot be inferred from browser DTLS/SRTP.

Required direction: no audio/caption persistence by default; caption UI is an ephemeral projection and meeting end clears captions (PRD REQ-010/011). This is not verified compliance: existing transcript-body logging and provider retention remain gaps. Future recording/history is outside the first release and requires explicit retention, consent, deletion and access-control requirements plus a storage owner; do not introduce a database incidentally.

Use bounded per-room/per-connection capacities for participants, pending requests, SDP/text bytes and voice input age; bound legacy AI output if enabled. The product requires a hard cap of three participants, recognition failure isolation and no retained outage audio; their enforcement is unimplemented. The [old numeric spike defaults](../archive/2026-09-26-coaching-architecture.md#10-security-capacity-and-privacy) are historical hypotheses, not current settings or meeting service guarantees. WI-003 retained the actual 35-second transport inactivity timeout; it is distinct from negotiation and the product's 60-second empty timer. Define overflow handling and measure caption latency/budget limits before claiming a capacity guarantee.

Log lifecycle changes once at the owning boundary, with correlation and safe error codes. Measure active/pre-STUN sessions, pending callbacks, queue depth/age, dropped frames, caption latency and shutdown duration. Do not log provider tokens, raw SDP, audio or transcript bodies by default. Even identifiers require bounded retention; metrics are not permission to retain conversations.

## 11. Migration and executable acceptance

Preserve the existing wire protocol, source layout and single-node behavior. The [old extraction sequence](../archive/2026-09-26-coaching-architecture.md#11-migration-and-executable-acceptance), including mandatory AI publisher extraction, is historical; it is not the current execution queue. Each future implementation slice needs its own confirmed scope and PRD assessment. Current work and authorization live in [ACTIVE](../../ACTIVE.md).

- **Existing baseline:** retain WI-002 Debug/direct-test and browser evidence, WI-003 expiry regression and targeted sanitizer evidence, and WI-004 automatic LAN/security/capture checks. CTest registration and the upstream browser production build remain gaps; do not call an empty CTest suite a pass.
- **Current physical acceptance:** WI-004 still requires two physical browser computers, then three for ten minutes, with original per-endpoint statistics and human audio/video observations. Automatic local browsers do not satisfy that boundary.
- **Before product integration:** resolve the meeting contracts and owners in C-01/C-04 and the PRD's proposed-details section. Verify the external bridge's recognition-only suitability and three-input isolation before planning a caption adapter or changing integration strategy. No automatic web/server stack selection or AI reply work follows.
- **When lifecycle/control seams are implemented:** prove single ownership, scoped cancellation, room close with pending callbacks and no post-close access; preserve the existing pre-STUN regression. Protocol/SDP/media fixtures must retain signaling behavior and WHIP publication isolation. Ordered shutdown remains separate from OS process termination.
- **When recognition integration is implemented:** use a fake external endpoint for interleaved/stale events, interim/final handling, failure isolation, queue overflow and codec mismatch. Verify real decoding and provider behavior in a separate, limited real-service acceptance run. Before billable calls, record the cost model and budget limits required by REQ-012 and obtain applicable execution authorization; verify provider retention before claiming full REQ-011 compliance.

Use boundary fakes where appropriate: clock/scheduler, transport sink, admission verifier and external VoiceAgent endpoint. Broader ownership changes need ASan/UBSan, repeated open/close and leak/handle checks beyond the focused WI-003 test. TSan matters only for actual worker crossings and does not replace loop-affinity tests. Weak-network/capacity work must record conditions and compare equivalent throughput, CPU, memory and latency baselines; existing local media results are not service targets.

## 12. Governance assessment and unresolved gates

| Dimension | Assessment and evidence | Remaining gap |
|-----------|-------------------------|---------------|
| Requirements/scope | **pass for documentation alignment:** §1/§4/C-01/C-04 distinguish meeting requirements from [historical coaching](../archive/2026-09-26-coaching-architecture.md) | Product remains unimplemented; PRD Draft |
| Module decomposition/interfaces | **gap:** §4–5 are Planned/Proposed; C-01–C-06 remain Outline | Meeting/link/caption owners and APIs unresolved; existing `Room` still combines concerns |
| Dependencies/compatibility | **gap:** §6 and C-06 retain narrow-interface and wire-compatibility constraints; WI-002 gives pinned-client evidence | Broad CMake includes; no compile-only consumer/forbidden-include enforcement; broader peers unverified |
| Ownership/concurrency/lifecycle | **gap with focused pass:** [WI-003](../reports/2026-09-26-pre-stun-expiry.md) proves repaired pre-STUN expiry and targeted sanitizer paths | Sole transport ownership, pending callbacks, room-wide cleanup and ordered shutdown remain unverified |
| Source/build/tests | **source boundary pass; build evidence obtained:** ADR 0001, `UPSTREAM.md`, [WI-002](../reports/2026-09-26-meeting-baseline.md) and [WI-004](../reports/2026-09-26-lan-media-baseline.md) | CTest zero registered tests, upstream client 11 TypeScript errors; physical acceptance still pending |
| Security/capacity/privacy | **gap with bounded fixture evidence:** WI-004 validates normal TLS and serving boundaries | Membership authorization, secure VoiceAgent transport, recognition queues/finality, transcript-body logs, provider retention/cost and weak-network limits |
| Persistence/UI delivery | **N/A for this documentation change:** no storage or product behavior added | Future meeting/caption work must define owners and validate clearing; no product-delivery claim |

Track `gate-sfu-build`, `gate-sfu-boundaries`, `gate-sfu-lifecycle`, `gate-session-admission`, `gate-media-capacity`, plus signaling and voice bridge gates in the [gate register](../reference/architecture-gates.md). No gate status changes here. Resolve C-01/C-04 against evidence before implementation; the current minimum next step remains WI-004 physical acceptance under its existing conditions.
