# Trusted meeting control (planned)

English | [中文](README.zh.md)

This directory is a placeholder for Rust meeting creation/lifecycle, admission and capacity control. Whether these responsibilities need a separate process and where authoritative state lives remain unresolved. A future Rust SFU owns media forwarding; the removed RTCPilot implementation is not a runtime dependency. No Rust backend is implemented here.

Follow the [Draft PRD](../docs/product-requirements.md), [current architecture](../docs/architecture/caption-meet-architecture.md) and [ADR 0002](../docs/decisions/0002-rust-source-transition.md). Provider keys stay outside browser bundles/storage. Implementation needs a scoped work item in [ACTIVE](../ACTIVE.md).
