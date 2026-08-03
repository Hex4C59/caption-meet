# 双语文档指南

[English](bilingual-documentation.md) | 中文

- 翻译状态：Human Reviewed
- 权威原文：[bilingual-documentation.md](bilingual-documentation.md)
- 原文版本：Uncommitted baseline
- 最近同步：2026-09-26

- 类型：指南
- 状态：Accepted
- 创建：2026-09-19
- 更新：2026-09-21
- 权威：CaptionMeet 产品仓库的语言配对规则
- 相关：[`README.zh.md`](README.zh.md)、[`scripts/docs-i18n-config.mjs`](../scripts/docs-i18n-config.mjs)

## 核心策略

- **英文为权威。** 中文为同目录下的 `*.zh.md`。
- **H1 后紧跟**语言切换：英文页链到 `basename.zh.md`；中文页链到 `basename.md`。
- 每个中文页声明：**翻译状态**、**权威原文**、**原文版本**、**最近同步**。
- 有效 **翻译状态**：`Machine Draft`、`Human Reviewed`、`Technically Verified`、`Stale`。
- 冲突时 **先改英文**，再同步中文。

## 哪些文档必须双语（机械检查）

`npm run docs:verify` 会运行 `docs:i18n:check`，强制列表见 [`scripts/docs-i18n-config.mjs`](../scripts/docs-i18n-config.mjs) 中的 `REQUIRED_CHINESE_PAIRS`。当前包括：

| 英文（权威） | 中文 |
|--------------|------|
| `README.md` | `README.zh.md` |
| `AGENTS.md` | `AGENTS.zh.md` |
| `docs/README.md` | `docs/README.zh.md` |
| 本文件 | `bilingual-documentation.zh.md` |
| `docs/git-commit-convention.md` | `docs/git-commit-convention.zh.md` |
| `docs/product-requirements.md` | `docs/product-requirements.zh.md` |
| `docs/guides/agent-collaboration.md` | `docs/guides/agent-collaboration.zh.md` |
| `docs/guides/agent/judgment.md` | `docs/guides/agent/judgment.zh.md` |
| `docs/reference/architecture-gates.md` | `docs/reference/architecture-gates.zh.md` |
| `docs/architecture/caption-meet-architecture.md` | `docs/architecture/caption-meet-architecture.zh.md` |

新增**权威**英文文档且需要双语时：在同一变更中加入 `REQUIRED_CHINESE_PAIRS` 与对应 `.zh.md`（或先将中文标为 `Stale`）。

**不在必选列表中的示例：** `ACTIVE.md`（会话状态，常英文为主）、可选 playbook（如 `typescript.md`）、`docs/decisions/` 下 ADR（英文权威，建议配 `.zh.md`）、以及 **`third_party/`** 下全部内容（vendor，不参与 CaptionMeet 文档 i18n）。

## 不参与扫描的路径

`docs-i18n-config.mjs` 的 `IGNORE_DIR_NAMES` 含 `third_party`。勿将 `third_party/RTCPilot/**` 加入必选配对；署名见 `LICENSE` / `UPSTREAM.md`。

## 翻译生命周期（中文 `*.zh.md`）

1. **Machine Draft** — 初稿；英文未稳定前原文版本用 `Uncommitted baseline`。
2. **Human Reviewed** — 维护者通读中文；**原文版本**设为所审英文文件的完整 git commit（`git rev-parse HEAD -- <path>`），更新 **最近同步**。
3. **Technically Verified** — 可选：英文大改后重跑 `npm run docs:verify`，确认标题、链接与非 localized 代码块仍一致。
4. **Stale** — 英文已越过记录的原文版本；修中文或标 `Stale`。除 `Stale` 外 `docs:i18n:check` 会对漂移报错。

勿未通读就批量标 `Human Reviewed`。优先 P0：根 `README`、`AGENTS`、PRD、架构、`agent-collaboration`。

## 译文中的代码块

`docs:i18n:check` 对必选配对比较围栏块（**数量与顺序一致**）。

| 围栏标记 | 用途 | 正文须与英文一致？ |
|----------|------|-------------------|
| `bash`、`json`、`typescript` 等 | 命令、配置、API | **是** |
| `text` | 路径、字面量 | **是**（不一致为 warning） |
| `text prompt` | 维护者复制粘贴的会话话术 | **否** — 同一序号英中均标 `prompt` |
| `text localized` | 标签可译、路径相同 | **否** — 路径 token 保持一致；两侧均标 `localized` |

示例（同一序号两侧均使用 `text prompt`）：

```text prompt
Continue CaptionMeet. @ ACTIVE.md only.
```

若正文因语言而不同，两侧须使用相同修饰符（`prompt` 或 `localized`）。未标注的围栏应保持一致，除非刻意使用 `localized`。

## 维护者工作流

1. 改 **英文** 权威文件。
2. 同步对应 `*.zh.md`（或标 `Stale` 后另补）。
3. 文档较多的会话结束前运行 `npm run docs:verify`。
4. **Commit message 仅用英文**，见 [`git-commit-convention.zh.md`](git-commit-convention.zh.md)。

## 范围

本指南适用于**仓库文档**，不适用于应用内 UI 文案。用户可见文案语言在 PRD 进入 `Accepted` 后单独定义。
