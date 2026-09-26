# Git 提交规范

[English](git-commit-convention.md) | 中文

- 翻译状态：Machine Draft
- 权威原文：[git-commit-convention.md](git-commit-convention.md)
- 原文版本：Uncommitted baseline
- 最近同步：2026-09-26

- 类型：指南
- 状态：Accepted
- 创建：<!-- date -->
- 权威：本仓库 commit message 的格式与语言（创建或改写提交时阅读）

## 适用范围

适用于本仓库人工或编码 Agent 撰写的全部 commit message，含 amend、reword、squash 等改写历史。

使用 **Conventional Commits**；**subject、body**（及需要的 footer）一律 **英文**。

> **内核提醒：** `AGENTS.kernel.md` L0 — 未经维护者明确要求勿提交；要求提交时遵循本指南。

## 格式

```text
<type>(<scope>): <summary>

<body>

<footer>
```

要求：subject 与 body 必填；footer 按需；段间空一行；一提交一逻辑变更；勿写密钥、完整 prompt、敏感路径。

Git 默认 merge/revert 文案可保留；手动改 revert 须用 body 说明原因。

## 语言

- 整段 message **英文**（含 body、自定义 footer）。
- 勿中英混写；标准 trailer 保持惯例；标识符与路径按需原样保留。

## 类型（type）

与英文版一致：`feat` `fix` `docs` `refactor` `test` `build` `ci` `perf` `style` `chore` `revert`。优先最具体类型，勿用 `chore` 掩盖含糊变更。

## 范围（scope）

小写，表示稳定领域；跨多域且无主域时可省略。

**CaptionMeet 起步列表**（随架构在本文增补）：

- `app`、`core`、`ui`、`host`、`api`、`contracts`、`deps`、`build`、`docs`

在 `docs/architecture/` 出现稳定边界后再加 scope；勿为单次文件臆造 scope。

## 摘要（subject）

祈使、小写开头（除非标识符大小写敏感）、无句末句号、建议 ≤72 字、单一结果。

## 正文（body）

英文；说明**原因**与**行为**；可短但须有目的。涉及架构、安全、持久化、公共契约、上游 SDK、构建/CI、用户可见行为或迁移时写清细节。未跑过的检查勿声称已通过。

## 页脚（footer）

```text
Refs: #42
Closes: #57
Co-authored-by: Name <email@example.com>
```

议题引用放 footer。

## 破坏性变更

subject 中 type/scope 后加 `!`，并附 `BREAKING CHANGE:` footer 说明不兼容行为与迁移。

```text prompt
feat(api)!: require client generation on connect

Clients must send generation with every command so the host
can reject stale incarnations after restart.

BREAKING CHANGE: Commands without generation are rejected.
```

## 提交前

查 `git status` 与暂存 diff；排除无关改动；按暂存内容选 type/scope；写英文 subject + body；无 amend/rebase/squash/force-push 除非维护者明确要求。

## 示例（message 仍为英文）

```text prompt
feat(core): add health probe for host startup

Expose a minimal ping so WI-001 spike can verify the process
model before UI lands.
```

```text prompt
docs(architecture): mark gate-build-baseline in spike

Record maintainer acceptance criteria for the toolchain spike
without claiming product features shipped.
```

## 无效示例

```text prompt
update docs
```

无 type、scope、结果或 body。
