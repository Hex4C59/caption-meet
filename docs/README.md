# CaptionMeet documentation index

English | [中文](README.zh.md)

- Type: Reference
- Status: Accepted
- Updated: 2026-10-14
- Authority: navigation for the current product and its historical records

## Current project

| Question | Start here |
|----------|------------|
| What is the product and what exists? | [Root README](../README.md) |
| What work is authorized now? | [ACTIVE](../ACTIVE.md) |
| What must the meeting do? | [Draft PRD](product-requirements.md), [domain vocabulary](../CONTEXT.md) |
| What does the Rust transition decide? | [ADR 0002](decisions/0002-rust-source-transition.md) |
| Which architecture constraints and questions apply? | [Current Rust outline and task routes](architecture/caption-meet-architecture.md#task-reading-guide) |
| What remains unverified? | [Architecture gates](reference/architecture-gates.md) |
| How do agents work in this repository? | [AGENTS](../AGENTS.md), then the full [collaboration guide](guides/agent-collaboration.md) before application-code proposals or edits |

These are reading routes, not implementation evidence. Rust frameworks, media libraries and contracts remain unresolved. The kernel/AGENTS baseline still applies; mentioning ACTIVE does not waive it. Architecture work also requires the [governance index](guides/architecture-governance.md#index-dimensions-at-a-glance) and affected dimensions.

## Historical material

The [archive index](archive/README.md) contains the superseded C++ architecture, baseline plan and detailed previous session state. The [report index](reports/README.md) records what the removed implementation passed, failed or left unverified. [Discussions](discussions/) preserve earlier product decisions and exploration.

Use these when a specific historical question requires them. They do not select Rust interfaces, restore old execution authorization or prove current runtime behavior. Old fixture commands require the corresponding historical source/artifacts and are not current setup instructions.

## Documentation and commits

Maintain affected English/Chinese pairs under the [bilingual policy](bilingual-documentation.md). Run `npm run docs:verify` after substantive edits and `npm run check:deps` for the source/attribution check. Neither command establishes product acceptance.

Read the [commit convention](git-commit-convention.md) when creating, editing or reviewing commits. Reading it does not authorize a commit.
