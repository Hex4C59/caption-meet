# Architecture gates

English | [中文](architecture-gates.zh.md)

- Type: Reference
- Status: Living
- Created: 2026-09-21
- Authority: which architectural risks require spike + Accepted ADR before treated as delivered

Status values: `Open` | `In spike` | `Accepted`

On 2026-10-14, [ADR 0002](../decisions/0002-rust-source-transition.md) accepted C/C++ source removal and the all-Rust direction. Only the source-layout decision is accepted. Native build/media evidence is historical; Rust implementation gates remain open. The removed VoiceAgent bridge has no replacement under test, so its gate returns to Open.

| Gate ID | Topic | Status | ADR |
|---------|-------|--------|-----|
| `gate-repo-layout` | Rust transition source layout; retain historical attribution | Accepted | [0002](../decisions/0002-rust-source-transition.md) |
| `gate-rtc-signaling` | Rust browser/SFU signaling and WebRTC join path documented and runnable | Open | — |
| `gate-voice-agent-bridge` | Rust/external speech-runtime contract, recognition-only mode and three-input isolation | Open | — |
| `gate-docs-baseline` | Engineering template docs + `npm run docs:verify` green | In spike | — |
| `gate-sfu-build` | Clean Rust SFU build and registered, reproducible baseline tests | Open | — |
| `gate-sfu-boundaries` | Narrow Rust interfaces, acyclic module dependencies and contract fixture tests | Open | — |
| `gate-sfu-lifecycle` | Single transport owner, pre-STUN expiry, cancellation-safe callbacks and ordered shutdown | Open | — |
| `gate-session-admission` | Scoped identity/permissions enforced by SFU; non-local deployment fails closed | Open | — |
| `gate-media-capacity` | Bounded queues and verified overflow, latency and resource budgets | Open | — |

Closing a gate requires an **Accepted** ADR linked in the ADR column. See [`../decisions/README.md`](../decisions/README.md).
