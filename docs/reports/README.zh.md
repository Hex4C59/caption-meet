# 历史 C++ 执行报告

[English](README.md) | 中文

- 翻译状态：Machine Draft
- 权威原文：[README.md](README.md)
- 原文版本：Uncommitted baseline
- 最近同步：2026-10-14
- 类型：参考
- 状态：Historical
- 更新：2026-10-14
- 权威：已删除 C++ 实现的历史结果索引

以下报告均描述旧 RTCPilot 实现，其源码方向已被 [ADR 0002](../decisions/0002-rust-source-transition.zh.md)替代。报告保留原测量、失败及边界，不证明 Rust 运行行为，也不恢复旧执行授权。

| 报告（2026-09-26） | 已取得的证据 | 边界 |
|-------------------|--------------|------|
| [WI-002 会议基线](2026-09-26-meeting-baseline.zh.md) | C++ Debug 构建、直接测试及本机合成浏览器媒体 | 未交付会议/字幕；上游客户端生产构建失败；未完成实体设备验收 |
| [WI-003 首个 STUN 前到期](2026-09-26-pre-stun-expiry.zh.md) | 局部到期修复、回收及针对性的 sanitizer/浏览器回归 | 不代表全 SFU 所有权或优雅退出验收 |
| [WI-004 局域网夹具](2026-09-26-lan-media-baseline.zh.md) | 自动 HTTPS/WSS、资源服务边界与采集/媒体验证 | 本机合成/模拟设备证据，不是实体多机验收 |
| [实体媒体验证交接](2026-09-26-physical-media-handoff.zh.md) | 有界独立预检及已准备的交接 | 真实实体媒体/重入及三台电脑验收未验证 |
| [双机准备检查](2026-09-26-two-device-readiness.zh.md) | 报告当时的只读准备检查 | 不代表当前网络/TLS 有效性或实体设备验收 |

历史复现参考：[归档基线方案](../archive/2026-10-14-cpp-meeting-baseline-spike.zh.md)、[旧夹具指南](../../scripts/baseline/README.md)、[原 ACTIVE](../archive/2026-10-14-pre-doc-cleanup-active.md)。

当前需求仍由 [Draft PRD](../product-requirements.zh.md)负责。后续 Rust 结果须单独记录源码版本、环境、命令和证据；当前工作见 [ACTIVE](../../ACTIVE.md)。
