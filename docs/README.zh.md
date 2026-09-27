# CaptionMeet 文档索引

[English](README.md) | 中文

- 翻译状态：Machine Draft
- 权威原文：[README.md](README.md)
- 原文版本：Uncommitted baseline
- 最近同步：2026-09-26

- 类型：参考
- 状态：Accepted
- 创建：<!-- date -->
- 权威：本产品仓库文档导航

## 阅读入口，不是全文必读清单

- 产品介绍：[根 README](../README.zh.md)。
- Agent 基础要求与任务触发：[AGENTS 渐进加载](../AGENTS.md#progressive-loading)；保留内核要求，提出/修改应用代码前仍须全文读取协作指南。
- 当前工作：[ACTIVE](../ACTIVE.md)。维护者只 @ ACTIVE 即可，不等于 Agent 可以跳过必要上下文。
- 架构任务：[按任务阅读导航](architecture/caption-meet-architecture.zh.md#task-reading-guide)。它是唯一详细任务到章节路由，区分适用约束与未决会议设计；不在此重复模块契约。
- 用户可见范围：[PRD](product-requirements.zh.md)，明确批准前为 Draft；每个 WI 进入 Build 前判断 PRD 影响。
- 决策与验证：[gate](reference/architecture-gates.zh.md)，再读相关关联 [ADR](decisions/README.zh.md)。
- 翻译维护：[双语规则](bilingual-documentation.zh.md)、受影响中英文对及配置。Agent 默认读英文权威正文，不默认全文读两种语言。
- [讨论](discussions/)和[归档索引](archive/README.zh.md)是可选历史上下文，不是例行启动输入。归档收录早期 ACTIVE 记录和已替代的语音教练方案；当前工作与有效授权仍由 ACTIVE 维护。

架构工作先扫描治理维度索引/标题，再按架构阅读导航细读适用项。受影响所有权、契约、安全和失败边界需要扩读，覆盖消费者与测试后停止。这是 Agent 主动路由，不是自动加载，也不是 `docs:verify` 能证明的行为。

## Agent：仅在与提交相关时

创建、修改或审查 commit message 时阅读 [`git-commit-convention.zh.md`](git-commit-convention.zh.md)（[English](git-commit-convention.md)）；日常编码不必读。

## 文档检查

实质性文档变更后运行 `npm run docs:verify`。
