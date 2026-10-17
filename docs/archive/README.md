# Archive

English | [中文](README.zh.md)

- Type: Reference
- Status: Accepted
- Updated: 2026-10-14
- Authority: historical context only

## How to use the archive

[ADR 0002](../decisions/0002-rust-source-transition.md) replaced the C++ implementation direction with Rust. [ACTIVE](../../ACTIVE.md), the [PRD](../product-requirements.md) and [current architecture outline](../architecture/caption-meet-architecture.md) describe current scope and unresolved work.

Archived states, commands and authorization retain their original context. They do not approve new execution, close gates or verify Rust. Preserve original failures and acceptance limits when citing them.

## Rust-transition archives

| Record | What it preserves |
|--------|-------------------|
| [Previous C++ meeting architecture](2026-10-14-cpp-meeting-architecture.md) ([Chinese](2026-10-14-cpp-meeting-architecture.zh.md)) | RTCPilot/libuv/CMake proposal, C-01 through C-06, ownership and historical evidence |
| [Executed C++ baseline plan](2026-10-14-cpp-meeting-baseline-spike.md) ([Chinese](2026-10-14-cpp-meeting-baseline-spike.zh.md)) | WI-002 build/test and synthetic-browser procedure, requiring historical source/artifacts |
| [ACTIVE before documentation cleanup](2026-10-14-pre-doc-cleanup-active.md) | Completed WI-005 source cleanup and superseded WI-004 details, including uncompleted physical acceptance |

The [report index](../reports/README.md) retains C++ execution results at their existing paths. The [legacy fixture guides](../../scripts/baseline/README.md) are historical procedures, not current setup instructions.

## Earlier records

- [Session history before the 2026-09-26 cleanup](2026-09-26-active-history.md): WI-001 through WI-004 proposals, authorization and maintenance history.
- [Coaching architecture](2026-09-26-coaching-architecture.md) ([Chinese](2026-09-26-coaching-architecture.zh.md)): the superseded single-human/AI proposal and Practice APIs.

## Adding an archive

Record why and when the material was superseded, retain useful evidence, and link the current source of truth. Use a dated filename, update affected relative paths/fragments and synchronize existing translations. Archiving does not accept unresolved work.
