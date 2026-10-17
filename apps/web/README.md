# Browser application (planned)

English | [中文](README.zh.md)

This directory is a placeholder for the Rust browser application: device preview/capture, explicit joining/leaving, participant audio/video and ephemeral Chinese captions. Media will use browser WebRTC through a Rust SFU. The framework, browser adapter and signaling/caption contracts are unselected; no application or Rust media interoperability is implemented here.

Follow the [Draft PRD](../../docs/product-requirements.md), [current architecture](../../docs/architecture/caption-meet-architecture.md) and [ADR 0002](../../docs/decisions/0002-rust-source-transition.md). Provider keys stay outside browser bundles/storage. Implementation needs a scoped work item in [ACTIVE](../../ACTIVE.md).
