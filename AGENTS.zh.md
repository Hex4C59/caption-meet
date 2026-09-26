# AGENTS.md

[English](AGENTS.md) | 中文

- 翻译状态：Machine Draft
- 权威原文：[AGENTS.md](AGENTS.md)
- 原文版本：Uncommitted baseline
- 最近同步：2026-09-26

**CaptionMeet** 产品叠加层。通用规则见 [`AGENTS.kernel.zh.md`](AGENTS.kernel.zh.md)。

## 权威栈

冲突时：(1) 内核与 playbook；(2) `Accepted` 后的 PRD；(3) `docs/architecture/caption-meet-architecture.md`；(4) `ACTIVE.md`；(5) discussions/archive 仅上下文。

## 项目事实

- 已确认产品方向（2026-09-26）：局域网三人音视频会议与逐人中文字幕；范围和 Draft 技术细节见 PRD。浏览器 UI 与薄控制服务仍为规划，媒体使用仓内 RTCPilot。
- 初始化阶段：勿将 MVP 规划描述为已交付。
- 目标：`apps/web`；可选 Node `server`。
- **RTCPilot（SFU）：** `third_party/RTCPilot/`（[ADR 0001](docs/decisions/0001-vendor-rtcpilot-in-tree.zh.md)）；来源见 `UPSTREAM.md` 与 `LICENSE`。
- **VoiceAgent：** 外部服务；经 RTCPilot `voice_agent` 配置集成，不在本仓重实现。会议纯识别适配尚未验证，提议不同集成策略须形成明确决策。
- 生产构建不得依赖本仓库外的未声明路径（不要求 `../RTCPilot` 兄弟仓）。
- SFU 行为以 `third_party/RTCPilot` 内文档与配置为准。

## 不可协商（L0）

- 密钥与 VoiceAgent API 不得进入前端包或浏览器存储。
- 浏览器按 RTCPilot 信令/WebRTC 对接，不绕过 SFU。
- 不在本仓重实现 VoiceAgent 循环。
- 修改 `third_party/RTCPilot` 时须保留上游 LICENSE 与版权声明。

## 分层（L1）

- **UI：** `apps/web`（规划）
- **业务：** `server`（规划）
- **SFU / 媒体：** `third_party/RTCPilot`（仓内）
- **语音智能体运行时：** 外部 VoiceAgent，经 RTCPilot 桥接

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
| RTCPilot / SFU / C++ | [RTCPilot README](third_party/RTCPilot/README.md)、[ADR 0001](docs/decisions/0001-vendor-rtcpilot-in-tree.md)、相关源码/测试及[架构路由](docs/architecture/caption-meet-architecture.md#task-reading-guide)；涉及配置或集成时读[配置指南](third_party/RTCPilot/config_guide.md) |
| TypeScript 应用或 Node 工具 | [TypeScript / Node playbook](docs/guides/agent/typescript.md) 的适用章节；TS 专属要求不适用于 C++ 或纯 `.mjs`，也不决定应用选型 |
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

- RTCPilot 上游：https://github.com/runner365/RTCPilot — 仓内副本 `third_party/RTCPilot/`。
- `voice_agent`：`third_party/RTCPilot/config_guide.md`；代码 `third_party/RTCPilot/src/webrtc_room/voice_agent/`。
- VoiceAgent：https://github.com/runner365/VoiceAgent
