# CaptionMeet 文档索引

[English](README.md) | 中文

- 翻译状态：Machine Draft
- 权威原文：[README.md](README.md)
- 原文版本：Uncommitted baseline
- 最近同步：2026-10-14
- 类型：参考
- 状态：Accepted
- 更新：2026-10-14
- 权威：当前产品与历史记录的导航

## 当前项目

| 问题 | 阅读入口 |
|------|----------|
| 产品是什么，已经有什么？ | [根 README](../README.zh.md) |
| 当前批准了什么工作？ | [ACTIVE](../ACTIVE.md) |
| 会议应具备什么行为？ | [Draft PRD](product-requirements.zh.md)、[领域术语](../CONTEXT.md) |
| Rust 转向决定了什么？ | [ADR 0002](decisions/0002-rust-source-transition.zh.md) |
| 哪些架构约束与未决问题适用？ | [当前 Rust 提纲与任务路由](architecture/caption-meet-architecture.zh.md#task-reading-guide) |
| 哪些事项尚未验证？ | [架构 gate](reference/architecture-gates.zh.md) |
| Agent 如何在本仓工作？ | [AGENTS](../AGENTS.zh.md)；提出或修改应用代码前再全文读取[协作指南](guides/agent-collaboration.zh.md) |

这些是阅读路由，不是实现证据。Rust 框架、媒体库及契约尚未确定。内核与 AGENTS 的基础阅读要求继续适用，只提及 ACTIVE 不能豁免。架构工作还须扫描[治理索引](guides/architecture-governance.md#index-dimensions-at-a-glance)并细读受影响维度。

## 历史材料

[归档索引](archive/README.zh.md)收录已被替代的 C++ 架构、基线方案和原会话详细状态。[报告索引](reports/README.zh.md)记录已删除实现曾经通过、失败或未验证的事项。[讨论](discussions/)保留早期产品决定和探索。

仅在具体历史问题需要时加载。这些材料不决定 Rust 接口，不恢复旧执行授权，也不证明当前运行行为。旧夹具命令需要对应历史源码和产物，不是当前环境搭建步骤。

## 文档与提交

按[双语规则](bilingual-documentation.zh.md)维护受影响的中英文对。实质性修改后运行 `npm run docs:verify`，并通过 `npm run check:deps` 检查源码清理与署名。这两条命令都不代表产品验收。

创建、修改或审查提交时读取[提交规范](git-commit-convention.zh.md)；读取不等于获得提交授权。
