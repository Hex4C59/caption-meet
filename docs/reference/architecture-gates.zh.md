# 架构 gate

[English](architecture-gates.md) | 中文

- 翻译状态：Machine Draft
- 权威原文：[architecture-gates.md](architecture-gates.md)
- 原文版本：Uncommitted baseline
- 最近同步：2026-10-14

- 类型：参考
- 状态：Living
- 创建：2026-09-21
- 权威：哪些架构风险须 spike + Accepted ADR 后才视为已交付

状态：`Open` | `In spike` | `Accepted`

2026-10-14 的 [ADR 0002](../decisions/0002-rust-source-transition.zh.md) 接受删除 C/C++ 与全 Rust 方向，仅源码布局决策被接受。原生构建/媒体证据为历史材料；Rust 实现 gate 保持未关闭。原 VoiceAgent 桥接已删除，尚无替代实现处于验证中，因此该 gate 回到 Open。

| Gate ID | 主题 | 状态 | ADR |
|---------|------|------|-----|
| `gate-repo-layout` | Rust 转向源码布局；保留历史署名 | Accepted | [0002](../decisions/0002-rust-source-transition.zh.md) |
| `gate-rtc-signaling` | Rust 浏览器/SFU 信令与 WebRTC 入会链路可文档化并可运行 | Open | — |
| `gate-voice-agent-bridge` | Rust 与外部语音运行时契约、仅识别模式及三路隔离 | Open | — |
| `gate-docs-baseline` | 工程模板文档与 `npm run docs:verify` 通过 | In spike | — |
| `gate-sfu-build` | 干净 Rust SFU 构建与已注册、可复现的基线测试 | Open | — |
| `gate-sfu-boundaries` | 窄 Rust 接口、无环模块依赖与契约 fixture 测试 | Open | — |
| `gate-sfu-lifecycle` | 单一传输所有者、pre-STUN 到期、安全取消回调与有序退出 | Open | — |
| `gate-session-admission` | SFU 强制作用域身份/权限，非本地部署校验失败时拒绝 | Open | — |
| `gate-media-capacity` | 有界队列及已验证的溢出、延迟、资源预算 | Open | — |

关闭 gate 须在 ADR 列链接 **Accepted** ADR。见 [`../decisions/README.zh.md`](../decisions/README.zh.md)。
