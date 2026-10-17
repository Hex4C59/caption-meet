# Historical C++ execution reports

English | [中文](README.zh.md)

- Type: Reference
- Status: Historical
- Updated: 2026-10-14
- Authority: index of recorded results for the removed C++ implementation

All reports below describe the former RTCPilot implementation. [ADR 0002](../decisions/0002-rust-source-transition.md) superseded that source direction. Original measurements, failures and limits remain in the reports; none establishes Rust runtime behavior or restores old execution authorization.

| Report (2026-09-26) | Established | Limits |
|---------------------|-------------|--------|
| [WI-002 meeting baseline](2026-09-26-meeting-baseline.md) | C++ Debug build/direct tests and synthetic local browser media | No shipped meeting/captions; upstream client production build failed; no physical acceptance |
| [WI-003 pre-STUN expiry](2026-09-26-pre-stun-expiry.md) | Focused expiry repair, reclamation and targeted sanitizer/browser regressions | No whole-SFU ownership or graceful-shutdown acceptance |
| [WI-004 LAN fixture](2026-09-26-lan-media-baseline.md) | Automatic HTTPS/WSS, serving-boundary and capture/media checks | Local synthetic/fake-device evidence, not physical multi-computer acceptance |
| [Physical-media handoff](2026-09-26-physical-media-handoff.md) | Bounded independent preflight and prepared handoff | Actual physical media/rejoin and three-computer acceptance unverified |
| [Two-device readiness](2026-09-26-two-device-readiness.md) | Read-only readiness at the report time | Not current network/TLS validity or physical acceptance |

Historical reproduction references: [archived baseline plan](../archive/2026-10-14-cpp-meeting-baseline-spike.md), [legacy fixture guide](../../scripts/baseline/README.md), [previous ACTIVE](../archive/2026-10-14-pre-doc-cleanup-active.md).

Current requirements remain in the [Draft PRD](../product-requirements.md). Future Rust results need their own source revision, environment, commands and evidence; current work lives in [ACTIVE](../../ACTIVE.md).
