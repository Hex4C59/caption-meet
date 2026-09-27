# 归档（非权威历史）

[English](README.md) | 中文

- 翻译状态：Machine Draft
- 权威原文：[README.md](README.md)
- 原文版本：Uncommitted baseline
- 最近同步：2026-09-26

- 类型：参考
- 状态：Accepted
- 创建：<!-- date -->
- 权威：**仅历史上下文**——已替代的 PRD、WI、spike、讨论等

## 用途

内容**不再活跃**但需保留审计轨迹时移入此处：

- 已被替代的 `product-requirements.md` 版本（在当前 PRD 中链接）。
- 不宜长期堆积在 `ACTIVE.md` 的历史 WI 方案和会话记录；未决工作与有效约束仍在当前入口保留摘要。
- 已放弃但有教训的 spike。

**不要**按归档文件实现。Agent 将 archive 视为只读背景。

## 归档记录

- [2026-09-26 整理前的会话历史](2026-09-26-active-history.md)：WI-001 至 WI-004 的原始方案、授权历史和维护记录。归档不表示验收工作或关闭 gate；当前继续条件由 [ACTIVE](../../ACTIVE.md) 维护。
- [历史语音教练架构](2026-09-26-coaching-architecture.zh.md)（[English](2026-09-26-coaching-architecture.md)）：包含单真人/AI 假设和 Practice API 的旧方案。[当前架构](../architecture/caption-meet-architecture.zh.md)标明保留的约束和未决会议设计。

## 移入前

1. 在归档文件顶部或 ADR 中写明**为何**替代（一句）。
2. 确认**当前**真相在 PRD（`Accepted`）、架构、gate、ADR 或 `ACTIVE.md`。
3. 建议命名 `docs/archive/YYYY-MM-DD-original-name.md`（扁平或按年分子目录）。

## Agent 规则

若归档与当前权威文档冲突，忽略归档并引用现行文件。
