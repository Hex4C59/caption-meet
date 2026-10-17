# CaptionMeet architecture

English | [中文](caption-meet-architecture.zh.md)

- Type: Architecture
- Status: Proposed; Rust direction confirmed, implementation design unresolved
- Updated: 2026-10-14
- Authority: confirmed constraints and questions to resolve before implementation
- Related: [PRD](../product-requirements.md), [ADR 0002](../decisions/0002-rust-source-transition.md), [ACTIVE](../../ACTIVE.md), [gates](../reference/architecture-gates.md)

## Current state

The maintainer chose Rust for all maintained application code, including the browser application, backend and selective forwarding unit (SFU). The C/C++ implementation was removed under ADR 0002. `apps/web` and `server` remain placeholders; this checkout has no Rust application, runnable SFU or Rust runtime acceptance evidence.

Rust frameworks, WebRTC libraries, wire protocols, crate layout and process boundaries are unselected. Existing JavaScript/Python documentation tools and experimental fixtures remain for later migration. Historical RTCPilot documentation describes the removed implementation.

<a id="task-reading-guide"></a>

## Task reading guide

After the kernel/AGENTS/ACTIVE/README baseline, read the full [collaboration guide](../guides/agent-collaboration.md) before application-code proposals or edits.

| Task | Read and resolve |
|------|------------------|
| User-visible meeting behavior | [PRD requirements and acceptance](../product-requirements.md#requirements-and-acceptance), [domain vocabulary](../../CONTEXT.md), affected constraints below |
| Modules, dependencies, interfaces or ownership | Responsibilities and unresolved design below; scan the [governance index](../guides/architecture-governance.md#index-dimensions-at-a-glance) and read affected dimensions in full |
| Media, signaling, admission or lifecycle | Define the relevant Rust contract, owner, cancellation and failure behavior; consult the matching [open gates](../reference/architecture-gates.md) |
| Recognition and captions | PRD REQ-005 through REQ-012, caption correlation and external-runtime questions below; verify the actual upstream contract |
| Build and tests | Verification requirements below; establish a Rust build/test baseline before reporting runtime results |
| Historical evidence or protocol investigation | [Archive index](../archive/README.md) and [report index](../reports/README.md); old APIs and commands do not authorize current implementation |

Expand reading when consumers, trust, ownership or failure paths cross the proposed scope. Keep the current WI and its approval in ACTIVE. This outline does not select libraries or approve implementation.

## Confirmed constraints

- Product scope remains three people in desktop Chrome on one LAN, with audio/video and independently attributed Chinese captions. The [Draft PRD](../product-requirements.md) owns user-visible requirements and acceptance.
- Browser media passes through an SFU using WebRTC. Rust must replace the removed C++ implementation; the previous protoo protocol and libuv execution model are not selected Rust constraints.
- Caller-provided names and IDs are not authorization. A trusted owner must enforce membership, the three-person cap and meeting-link lifetime.
- Provider credentials stay outside browser bundles, storage and logs. Captions are ephemeral and cleared when the meeting ends; recognition failure must leave the call usable.
- Keep the speech runtime external. Verify recognition-only behavior, independent inputs, retention and cost limits before claiming suitability or activating billable calls.
- Preserve upstream licenses and provenance. Production builds must declare their dependencies within the repository or reproducible dependency configuration.

## Responsibilities to design

These are planned responsibilities, not implemented modules, published interfaces or a selected process/crate layout.

| Responsibility | Intended work | Current status |
|----------------|---------------|----------------|
| Browser application | Preview/capture devices, coordinate joining/leaving, render participant media and ephemeral captions, release browser resources | `apps/web` placeholder; framework and browser integration unresolved |
| Trusted meeting control | Create/end meetings, validate admission, enforce capacity and link expiry, coordinate the empty-meeting timer | `server` placeholder; authoritative state and process placement unresolved |
| SFU/media | Negotiate transports, route participant audio/video, bound queues and clean up transport resources | Rust implementation and library unresolved |
| Speech integration | Bind recognition work to its participant/connection, translate external events, isolate failures and cancellation | External runtime retained; replacement Rust contract unresolved |

## Contracts, ownership and lifecycle to resolve

Before a feature enters implementation, record the affected operations, data, errors, ordering and tests. In particular:

- Distinguish meeting, participant, transport, publication and subscription identity. Identify the owner of each record/resource and reject events from replaced or cancelled connections.
- Define admission and link expiry, reconnect slot ownership, concurrent joins, the 60-second empty-meeting timer and restart behavior. An ended link cannot recreate a meeting.
- Define caption participant/connection identity, segment identity, revisions, finality and ordering from verified upstream semantics. Recognition recovery processes new speech without replaying outage audio.
- Choose how state changes are serialized and how tasks, timers, subscriptions and queues are cancelled and drained. Assign cleanup to one owner; closing one participant must not stop others.
- Set measured queue, payload and pending-work bounds with explicit overflow and timeout behavior. Provider endpoints and credentials are trusted deployment configuration, not browser-controlled upstream access.

The former C-01 through C-06 contracts are retained only in the [archived C++ architecture](../archive/2026-10-14-cpp-meeting-architecture.md#7-contract-catalog-all-outline). They are not living Rust contracts.

## Verification required

A future Rust work item must establish its own reproducible build, interface tests and runtime evidence. Verify browser interoperability, independent streams, reconnect/leave/rejoin, expiration/cancellation races and resource cleanup through the affected public interfaces.

Recognition fakes can verify revisions, interleaving, stale events, cancellation, bounded queues and failure isolation. Real decoding/provider behavior, retention and spending need separate limited verification. Record synthetic/local-browser results separately from physical multi-computer acceptance and preserve the PRD's three-computer acceptance requirement.

The current `npm test` checks documentation rules. Historical C++ builds, direct tests and browser reports do not validate Rust. [Runtime gates](../reference/architecture-gates.md) remain open; this document closes none.

## Historical references

- [Previous C++ meeting architecture](../archive/2026-10-14-cpp-meeting-architecture.md).
- [Executed C++ baseline plan](../archive/2026-10-14-cpp-meeting-baseline-spike.md).
- [Detailed previous ACTIVE record](../archive/2026-10-14-pre-doc-cleanup-active.md).
- [C++ reports and their limits](../reports/README.md), [legacy fixture guide](../../scripts/baseline/README.md).
- [ADR 0001](../decisions/0001-vendor-rtcpilot-in-tree.md), whose source-maintenance decision was superseded by ADR 0002; attribution remains in force.
