# ADR 0002: Transition maintained code to Rust and remove C/C++ sources

English | [中文](0002-rust-source-transition.zh.md)

- Type: Architecture decision
- Status: Accepted
- Created: 2026-10-14
- Gate: `gate-repo-layout`
- Authority: the maintainer's explicit all-Rust direction and request to delete C++ first

## Context

The maintainer chose Rust for all maintained application code, including browser UI, backend and SFU, then explicitly requested removal of all C++ code as the first step. This replaces the C++ implementation direction and the in-tree source-maintenance requirement of [ADR 0001](0001-vendor-rtcpilot-in-tree.md). Its attribution requirement remains in force.

## Decision

1. Remove RTCPilot's C/C++ implementation, headers, native tests, bundled native dependencies, native build projects and bundled native artifacts from the checkout.
2. Preserve RTCPilot's LICENSE, import provenance, dependency license/copyright notices and historical reports. Retained vendor documentation describes the removed implementation.
3. Use Rust for future maintained application code, tests and tools. This cleanup does not migrate existing Python/JavaScript tools or introduce a Rust implementation.
4. Keep the three-person LAN audio/video meeting and per-participant Chinese caption goals. Media must still use an SFU. Speech recognition remains external; the replacement integration requires verified contracts and isolation.
5. Rust framework, WebRTC library, protocol, process and module choices remain unresolved. Earlier suggestions are candidates, not accepted selections.

## Consequences and acceptance limits

The checkout no longer contains a buildable SFU or the native regression tests. Historical C++ build/media results do not verify future Rust code. WI-004 is superseded without completing physical-device acceptance; original reports remain unchanged except for links needed after source removal.

Only this source-layout transition is accepted. No signaling, media, lifecycle, admission, caption, capacity or Rust build gate is closed by deleting code. A future implementation needs its own scope and verification.
