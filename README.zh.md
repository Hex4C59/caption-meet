# CaptionMeet

[English](README.md) | 中文

- 翻译状态：Machine Draft
- 权威原文：[README.md](README.md)
- 原文版本：Uncommitted baseline
- 最近同步：2026-10-14
- 类型：指南
- 状态：Accepted
- 创建：2026-09-21
- 更新：2026-10-14
- 权威：产品仓库入口

**CaptionMeet** 面向电脑端 Chrome 上的三人局域网音视频会议与逐人中文字幕。维护者于 2026-10-14 选择全部自行维护的应用代码使用 Rust，并要求先删除 C++，见 [ADR 0002](docs/decisions/0002-rust-source-transition.zh.md)。

## 当前状态

C/C++ SFU 实现、原生测试、随附原生依赖、构建工程及原生产物已删除。**本次清理没有实现 Rust 应用或可运行 SFU。** 浏览器界面与业务服务目录仍为占位；Rust 库与框架尚未选定。

现有 JavaScript/Python 工具与实验 fixture 留待后续迁移。旧 C++ 架构、配置和报告作为历史参考，不代表当前构建或 Rust 验收证据。WI-004 被替代，物理设备验收未完成，见 [ACTIVE](ACTIVE.md)。

## 文档

- 当前工作与授权：[ACTIVE](ACTIVE.md)。
- 产品范围，仍为 Draft：[PRD](docs/product-requirements.zh.md)。
- Rust 转向与旧 C++ 设计：[架构](docs/architecture/caption-meet-architecture.zh.md)。
- Agent 指引与导航：[AGENTS](AGENTS.zh.md)、[文档索引](docs/README.zh.md)。

## 历史上游参考

已删除的 C++ SFU 来自 RTCPilot。[MIT 许可证](third_party/RTCPilot/LICENSE)、[导入来源](third_party/RTCPilot/UPSTREAM.md)、随附依赖声明及协议/配置文档仍保留在 `third_party/RTCPilot/`。该目录已不是可构建的 vendor 副本。

VoiceAgent 保持为外部语音运行时参考。仅识别模式、三路隔离和替代接入尚未验证；本仓没有实现 ASR/LLM/TTS 运行时。凭据须留在浏览器产物及存储之外，会议媒体仍须经过 SFU。

## 目录

```text
caption-meet/
├── ACTIVE.md / AGENTS.md
├── apps/web/          # placeholder
├── server/            # placeholder
├── third_party/RTCPilot/  # historical docs, provenance and licenses
├── docs/
└── scripts/           # existing tooling; Rust migration pending
```

## 检查

```bash
npm test
npm run docs:verify
npm run check:deps
```

这些检查覆盖现有工具、文档和源码清理，不构建或验证 Rust 产品。文档扫描排除 Git 忽略的本机 `.agents` 技能目录；仓库链接及中英文配对继续检查。

## 致谢

感谢 RTCPilot 与 VoiceAgent 作者及贡献者。历史源码与许可证署名继续保留。
