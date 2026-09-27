# CaptionMeet documentation index

English | [中文](README.zh.md)

- Type: Reference
- Status: Accepted
- Created: <!-- date -->
- Authority: navigation for this product repository

## Entry points, not a full-reading checklist

- Product introduction: [root README](../README.md).
- Agent baseline and task triggers: [AGENTS progressive loading](../AGENTS.md#progressive-loading); preserve kernel requirements and the full collaboration-guide read before application-code proposals/edits.
- Current work: [ACTIVE](../ACTIVE.md). Mentioning only ACTIVE is sufficient for the maintainer, not permission for the agent to skip required context.
- Architecture tasks: [task reading guide](architecture/caption-meet-architecture.md#task-reading-guide). It is the single detailed task-to-section map, separating applicable constraints from unresolved meeting design; do not duplicate module contracts here.
- User-visible scope: [PRD](product-requirements.md), Draft until explicitly approved; assess PRD impact before each WI enters Build.
- Decisions and validation: [gates](reference/architecture-gates.md), then only relevant linked [ADRs](decisions/README.md).
- Translation maintenance: [bilingual policy](bilingual-documentation.md), affected English/Chinese pair and configuration. Agents normally read the English authority, not both entire versions.
- [Discussions](discussions/) and the [archive index](archive/README.md) are optional historical context, not routine startup input. The archive links earlier ACTIVE records and the superseded coaching proposal; current work and effective authorization remain in ACTIVE.

Scan the governance dimension index/headings for architecture work, then read applicable details as specified in the architecture reading guide. Expand across affected ownership, contract, security and failure boundaries; stop after consumers and tests are covered. This is manual agent routing, not automatic loading or a check performed by `docs:verify`.

## Agent: commits only

Read [`git-commit-convention.md`](git-commit-convention.md) when creating, editing, or reviewing commit messages—not for ordinary coding sessions.

## Documentation checks

Run `npm run docs:verify` after substantive doc changes.
