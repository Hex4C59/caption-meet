# CaptionMeet

[English](README.md) | 中文

- 翻译状态：Machine Draft
- 权威原文：[README.md](README.md)
- 原文版本：Uncommitted baseline
- 最近同步：2026-09-26

- 类型：指南
- 状态：Accepted
- 创建：2026-09-21
- 权威：本产品仓库入口

**CaptionMeet** 正在发展为 **带中文实时字幕的三人音视频会议工具**，首版面向同一局域网内的电脑端 Chrome。维护者于 2026-09-26 确认此方向，以积累 C++ RTC 服务端经验。浏览器产品尚未实现，媒体使用仓库内的 RTCPilot SFU。

## 文档

工作流与当前工作项：[`docs/README.md`](docs/README.md)、[`AGENTS.md`](AGENTS.md)、[`ACTIVE.md`](ACTIVE.md)。

产品范围（Draft PRD）：[`docs/product-requirements.zh.md`](docs/product-requirements.zh.md)。架构：[`docs/architecture/caption-meet-architecture.zh.md`](docs/architecture/caption-meet-architecture.zh.md)。

## 基于上游开源项目

| 上游项目 | 说明 | 许可证 | 仓库 |
|----------|------|--------|------|
| **RTCPilot** | WebRTC SFU：房间、媒体转发、`voice_agent` 对接 | MIT | [github.com/runner365/RTCPilot](https://github.com/runner365/RTCPilot) |
| **VoiceAgent** | 实时语音对话智能体（ASR / LLM / TTS 等） | 见上游仓库 | [github.com/runner365/VoiceAgent](https://github.com/runner365/VoiceAgent) |

**RTCPilot** 以源码形式存放在 [`third_party/RTCPilot/`](third_party/RTCPilot/)（MIT；见 `LICENSE` 与 `UPSTREAM.md`），在本仓库内修改 SFU。**VoiceAgent** 仍为独立部署服务，经 RTCPilot 配置对接。

## 本仓库职责

| 部分 | 职责 |
|------|------|
| **本仓库** | 会议 UI、生命周期及逐人实时字幕（规划中） |
| `third_party/RTCPilot` | 实时进房、媒体路径、与 VoiceAgent 的对接（仓内 fork） |
| 上游 VoiceAgent | 外部语音运行时；是否适合会议纯识别仍需验证 |

## 目录结构

```
caption-meet/
├── README.md
├── ACTIVE.md / AGENTS.md
├── third_party/
│   └── RTCPilot/      # vendored SFU (MIT)
├── docs/
├── apps/web/          # browser client (placeholder)
├── server/            # thin business API (placeholder)
└── scripts/           # local dev / doc checks
```

**CaptionMeet** 取自实时字幕（Caption）与会议（Meet）。本地项目目录于 2026-09-26 从 `voice-coach` 改为 `caption-meet`，保留 `voice-coach -> caption-meet` 兼容软链接，使现有构建缓存、开发 TLS 配置和实验记录中的绝对路径继续有效。后续开发使用 `caption-meet`；复用这些产物期间请保留软链接。

## 当前状态

会议范围已确认，PRD 仍为 Draft。WI-002 已取得 Debug 构建、直接测试、双端与三端浏览器媒体实测结果，并完成小范围重入修复；这不代表会议产品已交付或三台电脑验收通过。见 `ACTIVE.md`、[执行报告](docs/reports/2026-09-26-meeting-baseline.zh.md)及[基线方案](docs/plans/meeting-baseline-spike.zh.md)。

## 检查

```bash
npm run docs:verify
npm run check:deps
```

## 致谢

感谢 [RTCPilot](https://github.com/runner365/RTCPilot) 与 [VoiceAgent](https://github.com/runner365/VoiceAgent) 的作者与贡献者。
