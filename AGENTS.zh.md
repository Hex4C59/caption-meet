# AGENTS.md

[English](AGENTS.md) | 中文

- 翻译状态：Machine Draft
- 权威原文：[AGENTS.md](AGENTS.md)
- 原文版本：Uncommitted baseline
- 最近同步：2026-10-14

**CaptionMeet** 产品叠加层。通用规则见 [`AGENTS.kernel.zh.md`](AGENTS.kernel.zh.md)。

## 权威栈

冲突时：(1) 内核与 playbook；(2) `Accepted` 后的 PRD；(3) `docs/architecture/caption-meet-architecture.md`；(4) `ACTIVE.md`；(5) discussions/archive 仅上下文。

## 项目事实

- 已确认产品方向（2026-09-26）：三人局域网音视频会议与逐人中文字幕；范围与 Draft 技术细节见 PRD。
- 维护者于 2026-10-14 选择全部自行维护代码使用 Rust，并要求先删除 C++；本次转向以 [ADR 0002](docs/decisions/0002-rust-source-transition.md) 为准。旧 C++ 架构与报告为历史材料，产品实现仍未完成。
- 目标：Rust 浏览器应用（`apps/web`）、后端与 SFU。目录仍为占位，Rust 框架和媒体库未选定；现有 Node/Python 工具留待另行确定迁移范围。
- **RTCPilot：** C/C++ 实现及原生依赖已删除；`third_party/RTCPilot/` 保留历史文档、`UPSTREAM.md`、`LICENSE` 及依赖署名。[ADR 0001](docs/decisions/0001-vendor-rtcpilot-in-tree.md) 描述旧源码布局。
- **VoiceAgent：** 外部运行时，本仓不重实现。原 RTCPilot 桥接已删除；Rust 接入契约、仅识别模式与三路隔离须先验证。
- 生产构建不得依赖仓库外未声明路径，不要求 `../RTCPilot` 相邻仓。
- 历史 RTCPilot/VoiceAgent 文档描述已删除的实现，不证明未来 Rust SFU 的能力。

## 不可协商（L0）

- 密钥及 VoiceAgent API key 不得进入 `apps/web` 产物或浏览器存储。
- 浏览器媒体通过 WebRTC 与 SFU；Rust 信令/媒体契约仍须定义并验证。
- 语音运行时保持外置；契约验证后仅实现已确定范围的 Rust 接入。
- 编辑 `third_party/RTCPilot` 时保留上游 LICENSE、版权声明与署名。

内核 L0 继续适用。

## 分层（L1）

- **UI：** `apps/web`（计划）。
- **业务：** `server`（计划）。
- **SFU / 媒体：** 计划用 Rust 实现，源码位置和库未选定。
- **语音运行时：** 外置，替代 Rust 接入尚未确定。

## 渐进式加载

- 保留内核 **Before you start** 的基础要求：内核、本叠加层、[ACTIVE](ACTIVE.md)、根 README、当前目录结构、包配置及相关测试。提出或修改应用代码前，须全文读取[协作指南](docs/guides/agent-collaboration.md)；内核的只读例外仍适用。
- 然后只选本次任务相关的下列入口。英文为权威，不默认全文加载双语；翻译、明确的中文审阅或歧义核对时再读中文。同一会话可复用已读且未变化的上下文；文件变化或上下文丢失后重读。
- 架构任务先扫描治理指南的维度索引和检查项标题，再细读适用维度。不得为了省上下文跳过受影响契约、所有权、取消或信任边界。
- 覆盖本次消费者、契约、所有者和测试后停止扩读；跨边界或缺少证据时跟进引用。Proposed/Outline 架构不代表实现事实。
- 这是 Agent 执行的阅读协议，不是自动文件注入。任务到章节的详细路由只维护在[架构阅读导航](docs/architecture/caption-meet-architecture.zh.md#task-reading-guide)。

## 加载地图

下列 Agent 入口指向英文权威正文；中文读者可通过各文档语言切换查看译文。

| 任务触发 | 基础阅读之后加载 |
|------|------|
| Rust 转向 / SFU | [ADR 0002](docs/decisions/0002-rust-source-transition.md)、[当前架构路由](docs/architecture/caption-meet-architecture.md#task-reading-guide)及受影响 gate；仅为具体历史问题加载[归档](docs/archive/README.md) |
| 现有 Node/TypeScript 工具 | [旧 TypeScript / Node playbook](docs/guides/agent/typescript.md) 的适用章节；TypeScript 专属规则不适用于纯 `.mjs` 或 Rust，也不决定应用选型 |
| 判断 / 是否继续 | [判断指南](docs/guides/agent/judgment.md) |
| 模块、API、依赖、契约、所有权 | [架构路由](docs/architecture/caption-meet-architecture.md#task-reading-guide)、[治理索引及适用维度](docs/guides/architecture-governance.md#index-dimensions-at-a-glance) |
| 用户可见行为 / WI 的 PRD 判定 | [PRD](docs/product-requirements.md) 与相关架构章节 |
| Gate 或来源决策 | [Gate 登记](docs/reference/architecture-gates.md)，以及与本次决策有关的关联 ADR |
| 文档配对 / 翻译 | [双语规则](docs/bilingual-documentation.md)、受影响双语对及 [i18n 配置](scripts/docs-i18n-config.mjs) |
| 创建/修改/审查提交 | [提交规范](docs/git-commit-convention.md)；读取不等于获得 commit 授权 |

[文档索引](docs/README.zh.md) 是导航，不要求全文读取所有链接。discussions/archive 仅在需要相关历史时加载。

## 任务完成

遵循内核 § Task completion。本仓：`npm run docs:verify`、`npm run check:deps`。

## 上游

- RTCPilot 上游：https://github.com/runner365/RTCPilot — 署名与历史文档保留在 `third_party/RTCPilot/`。
- 历史 `voice_agent` 协议/配置：`third_party/RTCPilot/config_guide.md`；原生桥接源码已删除。
- VoiceAgent：https://github.com/runner365/VoiceAgent
