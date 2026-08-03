# AGENTS.md

English | [中文](AGENTS.zh.md)

Product overlay for **CaptionMeet**. **Universal rules** are in [`AGENTS.kernel.md`](AGENTS.kernel.md) ([中文](AGENTS.kernel.zh.md)).

## Authority stack

On conflict: (1) `AGENTS.kernel.md` and agent playbooks; (2) `docs/product-requirements.md` when `Accepted`; (3) `docs/architecture/caption-meet-architecture.md`; (4) `ACTIVE.md`; (5) `docs/discussions/` and `docs/archive/` are context only.

## Project facts

- Confirmed product direction (2026-09-26): three-person LAN audio/video meetings with per-participant Chinese live captions; see the PRD for scope and Draft technical details. Browser UI and thin control services remain planned; media uses vendored RTCPilot.
- Initialization phase: do not describe planned MVP items as shipped (see kernel).
- Target: browser (`apps/web`); optional Node business API (`server`).
- **RTCPilot (SFU):** maintained in-repo at `third_party/RTCPilot/` per [ADR 0001](docs/decisions/0001-vendor-rtcpilot-in-tree.md); upstream lineage in `third_party/RTCPilot/UPSTREAM.md` and `LICENSE`.
- **VoiceAgent:** external service; integrate via RTCPilot `voice_agent` config—not reimplemented in caption-meet. Recognition-only meeting suitability is unverified; proposing a different integration strategy requires an explicit decision.
- Production builds must not depend on undeclared paths outside this repository (no required `../RTCPilot` sibling).
- SFU and voice-agent behavior: RTCPilot/VoiceAgent docs and config in `third_party/RTCPilot`—not assumptions.

## Non-negotiables (L0) — product security

- Secrets and VoiceAgent API keys must not ship in `apps/web` bundles or browser storage.
- Browser uses RTCPilot signaling/WebRTC as documented; do not bypass SFU for media.
- Do not reimplement the VoiceAgent loop inside this repo; integrate via RTCPilot `voice_agent`.
- When editing `third_party/RTCPilot`, preserve upstream LICENSE/copyright notices; do not remove attribution.

Kernel L0 still applies from `AGENTS.kernel.md`.

## Layer model (L1 summary)

- **UI:** `apps/web` (planned).
- **Business:** `server` (planned).
- **SFU / media:** `third_party/RTCPilot` (in-tree).
- **Voice agent runtime:** VoiceAgent (external) via RTCPilot bridge.

## Progressive loading

- Preserve the kernel's **Before you start** baseline: kernel, this overlay, [ACTIVE](ACTIVE.md), root README, current tree, package configuration and relevant tests. Before proposing/editing application code, read the [collaboration guide](docs/guides/agent-collaboration.md) in full; the kernel's read-only exception still applies.
- Then select only task-relevant routes below. English is authoritative; do not load both languages by default. Load Chinese for translation work, explicit language review or ambiguity checking. Reuse already-read, unchanged context within a session; reread after changes or context loss.
- For architecture work, scan the governance **Index (dimensions at a glance)** and checklist headings, then read applicable dimensions in detail. Do not skip affected contracts, ownership, cancellation or trust boundaries to save context.
- Stop expanding when the task's consumers, contracts, owners and tests are covered. Follow references when a change crosses a boundary or evidence is missing. Proposed/Outline architecture is not evidence of implementation.
- This is an agent-executed reading protocol, not automatic file injection. Detailed task-to-section routes live only in the [architecture reading guide](docs/architecture/caption-meet-architecture.md#task-reading-guide).

## Load map

| Task trigger | Read after the baseline |
|-------------|------------|
| RTCPilot / SFU / C++ | [RTCPilot README](third_party/RTCPilot/README.md), [ADR 0001](docs/decisions/0001-vendor-rtcpilot-in-tree.md), relevant source/tests and [architecture routes](docs/architecture/caption-meet-architecture.md#task-reading-guide); load [configuration guide](third_party/RTCPilot/config_guide.md) when configuration or integration is involved |
| TypeScript application code or Node tooling | Relevant sections of [TypeScript / Node playbook](docs/guides/agent/typescript.md); TS-specific requirements do not apply to C++ or plain `.mjs`, and do not select the application stack |
| Judgment / go-no-go | [Judgment playbook](docs/guides/agent/judgment.md) |
| Modules, APIs, dependencies, contracts or ownership | [Architecture routes](docs/architecture/caption-meet-architecture.md#task-reading-guide), [governance index and applicable dimensions](docs/guides/architecture-governance.md#index-dimensions-at-a-glance) |
| User-visible behavior / WI PRD assessment | [PRD](docs/product-requirements.md) and affected architecture sections |
| Gate or sourcing decisions | [Gate register](docs/reference/architecture-gates.md), only the linked ADRs relevant to the decision |
| Document pairing / translation | [Bilingual policy](docs/bilingual-documentation.md), affected pair and [i18n config](scripts/docs-i18n-config.mjs) |
| Creating/editing/reviewing commits | [Commit convention](docs/git-commit-convention.md); reading it does not authorize a commit |

[Documentation index](docs/README.md) is navigation, not an instruction to read every linked file. Discussions/archive are loaded only for relevant history.

## Task completion

Follow `AGENTS.kernel.md` § Task completion. Product-specific: `npm run docs:verify`, `npm run check:deps`.

## Upstream pointers

- RTCPilot upstream: https://github.com/runner365/RTCPilot — vendored copy under `third_party/RTCPilot/`.
- `voice_agent`: `third_party/RTCPilot/config_guide.md`; code under `third_party/RTCPilot/src/webrtc_room/voice_agent/`.
- VoiceAgent: https://github.com/runner365/VoiceAgent
