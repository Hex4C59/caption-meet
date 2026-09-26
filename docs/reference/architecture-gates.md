# Architecture gates

English | [中文](architecture-gates.zh.md)

- Type: Reference
- Status: Living
- Created: 2026-09-21
- Authority: which architectural risks require spike + Accepted ADR before treated as delivered

Status values: `Open` | `In spike` | `Accepted`

| Gate ID | Topic | Status | ADR |
|---------|-------|--------|-----|
| `gate-repo-layout` | Product shell + vendored SFU; apps/web and server boundaries | Accepted | [0001](../decisions/0001-vendor-rtcpilot-in-tree.md) |
| `gate-rtc-signaling` | Browser join path via RTCPilot (protoo/WebSocket + WebRTC) documented and runnable | Open | — |
| `gate-voice-agent-bridge` | `voice_agent` config and VoiceAgent service wiring per RTCPilot docs | In spike | — |
| `gate-docs-baseline` | Engineering template docs + `npm run docs:verify` green | In spike | — |
| `gate-sfu-build` | Clean in-tree C++17 build and registered, reproducible baseline tests | Open | — |
| `gate-sfu-boundaries` | Narrow public headers, acyclic target dependencies and contract fixture tests | Open | — |
| `gate-sfu-lifecycle` | Single transport owner, pre-STUN expiry, cancellation-safe callbacks and ordered shutdown | Open | — |
| `gate-session-admission` | Scoped identity/permissions enforced by SFU; non-local deployment fails closed | Open | — |
| `gate-media-capacity` | Bounded queues and verified overflow, latency and resource budgets | Open | — |

Closing a gate requires an **Accepted** ADR linked in the ADR column. See [`../decisions/README.md`](../decisions/README.md).
