# AGENTS.md

English | [中文](AGENTS.zh.md)

Product overlay for **CaptionMeet**. **Universal rules** are in [`AGENTS.kernel.md`](AGENTS.kernel.md) ([中文](AGENTS.kernel.zh.md)).

## Authority stack

On conflict: (1) `AGENTS.kernel.md` and agent playbooks; (2) `docs/product-requirements.md` when `Accepted`; (3) `docs/architecture/caption-meet-architecture.md`; (4) `ACTIVE.md`; (5) `docs/discussions/` and `docs/archive/` are context only.

## Project facts

- Confirmed product direction (2026-09-26): three-person LAN audio/video meetings with per-participant Chinese live captions; see the PRD for scope and Draft technical details. Product implementation remains unimplemented. On 2026-10-14 the maintainer chose all-Rust maintained code and requested C++ removal; [ADR 0002](docs/decisions/0002-rust-source-transition.md) governs this transition. The older C++ architecture and reports are historical.
- Initialization phase: do not describe planned MVP items as shipped (see kernel).
- Target: Rust browser application (`apps/web`), backend and SFU. Directories remain placeholders; no Rust framework or media library is selected. Existing Node/Python tooling awaits a separately scoped migration.
- **RTCPilot:** C/C++ implementation and native dependencies removed; `third_party/RTCPilot/` retains historical documentation, `UPSTREAM.md`, `LICENSE` and dependency attribution. [ADR 0001](docs/decisions/0001-vendor-rtcpilot-in-tree.md) describes the previous source layout.
- **VoiceAgent:** external runtime, not reimplemented here. The former RTCPilot bridge is removed. Rust integration contracts, recognition-only suitability and three-input isolation require verification before implementation.
- Production builds must not depend on undeclared paths outside this repository (no required `../RTCPilot` sibling).
- Historical RTCPilot/VoiceAgent docs describe the removed implementation, not capabilities of a future Rust SFU.

## Non-negotiables (L0) — product security

- Secrets and VoiceAgent API keys must not ship in `apps/web` bundles or browser storage.
- Browser media uses WebRTC through an SFU; the Rust signaling/media contracts remain to be defined and verified.
- Keep the speech runtime external; implement only the scoped Rust integration after its contract is verified.
- When editing `third_party/RTCPilot`, preserve upstream LICENSE/copyright notices; do not remove attribution.

Kernel L0 still applies from `AGENTS.kernel.md`.

## Layer model (L1 summary)

- **UI:** `apps/web` (planned).
- **Business:** `server` (planned).
- **SFU / media:** Rust implementation planned; no source location or library selected.
- **Voice agent runtime:** external; replacement Rust integration unresolved.

## Progressive loading

- Preserve the kernel's **Before you start** baseline: kernel, this overlay, [ACTIVE](ACTIVE.md), root README, current tree, package configuration and relevant tests. Before proposing/editing application code, read the [collaboration guide](docs/guides/agent-collaboration.md) in full; the kernel's read-only exception still applies.
- Then select only task-relevant routes below. English is authoritative; do not load both languages by default. Load Chinese for translation work, explicit language review or ambiguity checking. Reuse already-read, unchanged context within a session; reread after changes or context loss.
- For architecture work, scan the governance **Index (dimensions at a glance)** and checklist headings, then read applicable dimensions in detail. Do not skip affected contracts, ownership, cancellation or trust boundaries to save context.
- Stop expanding when the task's consumers, contracts, owners and tests are covered. Follow references when a change crosses a boundary or evidence is missing. Proposed/Outline architecture is not evidence of implementation.
- This is an agent-executed reading protocol, not automatic file injection. Detailed task-to-section routes live only in the [architecture reading guide](docs/architecture/caption-meet-architecture.md#task-reading-guide).

## Load map

| Task trigger | Read after the baseline |
|-------------|------------|
| Rust transition / SFU | [ADR 0002](docs/decisions/0002-rust-source-transition.md), [current architecture routes](docs/architecture/caption-meet-architecture.md#task-reading-guide) and affected gates; consult the [archive](docs/archive/README.md) only for a specific historical question |
| Existing Node/TypeScript tooling | Applicable parts of the [legacy TypeScript / Node playbook](docs/guides/agent/typescript.md); TypeScript-only rules do not apply to plain `.mjs` or Rust and do not select the application stack |
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

- RTCPilot upstream: https://github.com/runner365/RTCPilot — attribution and historical documentation under `third_party/RTCPilot/`.
- Historical `voice_agent` protocol/configuration: `third_party/RTCPilot/config_guide.md`; native bridge source removed.
- VoiceAgent: https://github.com/runner365/VoiceAgent
