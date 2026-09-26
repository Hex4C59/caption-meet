# 架构 gate

[English](architecture-gates.md) | 中文

- 翻译状态：Human Reviewed
- 权威原文：[architecture-gates.md](architecture-gates.md)
- 原文版本：Uncommitted baseline
- 最近同步：2026-09-21

- 类型：参考
- 状态：Living
- 创建：2026-09-21
- 权威：哪些架构风险须 spike + Accepted ADR 后才视为已交付

状态：`Open` | `In spike` | `Accepted`

| Gate ID | 主题 | 状态 | ADR |
|---------|------|------|-----|
| `gate-repo-layout` | 产品壳与 vendor SFU；apps/web 与 server 职责 | Accepted | [0001](../decisions/0001-vendor-rtcpilot-in-tree.zh.md) |
| `gate-rtc-signaling` | 浏览器经 RTCPilot 进房（protoo/WebSocket + WebRTC）可文档化并可运行 | Open | — |
| `gate-voice-agent-bridge` | 按 RTCPilot 文档配置 `voice_agent` 与 VoiceAgent 服务 | In spike | — |
| `gate-docs-baseline` | 工程模板文档与 `npm run docs:verify` 通过 | In spike | — |
| `gate-sfu-build` | 仓内干净 C++17 构建与已注册、可复现的基线测试 | Open | — |
| `gate-sfu-boundaries` | 窄公开头文件、无环 target 依赖与契约 fixture 测试 | Open | — |
| `gate-sfu-lifecycle` | 单一传输所有者、pre-STUN 到期、安全取消回调与有序退出 | Open | — |
| `gate-session-admission` | SFU 强制作用域身份/权限，非本地部署校验失败时拒绝 | Open | — |
| `gate-media-capacity` | 有界队列及已验证的溢出、延迟、资源预算 | Open | — |

关闭 gate 须在 ADR 列链接 **Accepted** ADR。见 [`../decisions/README.zh.md`](../decisions/README.zh.md)。
