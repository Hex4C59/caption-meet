# Bilingual documentation guide

English | [中文](bilingual-documentation.zh.md)

- Type: Guide
- Status: Accepted
- Created: 2026-09-19
- Updated: 2026-09-21
- Authority: language pairing for the CaptionMeet product repository
- Related: [`README.md`](README.md), [`scripts/docs-i18n-config.mjs`](../scripts/docs-i18n-config.mjs)

## Core policy

- **English is authoritative.** Chinese lives in `*.zh.md` beside the English file (same directory).
- Put the language switcher **immediately after the H1**: English → `basename.zh.md`; Chinese → `basename.md`.
- Every Chinese page declares metadata: **翻译状态**, **权威原文**, **原文版本**, **最近同步**.
- Valid **翻译状态**: `Machine Draft`, `Human Reviewed`, `Technically Verified`, `Stale`.
- On conflict, **edit English first**, then sync Chinese.

## What must be bilingual (mechanical)

`npm run docs:verify` runs `docs:i18n:check`, which enforces the list in [`scripts/docs-i18n-config.mjs`](../scripts/docs-i18n-config.mjs) (`REQUIRED_CHINESE_PAIRS`). As of this guide, that includes:

| English (authoritative) | Chinese |
|-------------------------|---------|
| `README.md` | `README.zh.md` |
| `AGENTS.md` | `AGENTS.zh.md` |
| `docs/README.md` | `docs/README.zh.md` |
| This file | `bilingual-documentation.zh.md` |
| `docs/git-commit-convention.md` | `docs/git-commit-convention.zh.md` |
| `docs/product-requirements.md` | `docs/product-requirements.zh.md` |
| `docs/guides/agent-collaboration.md` | `docs/guides/agent-collaboration.zh.md` |
| `docs/guides/agent/judgment.md` | `docs/guides/agent/judgment.zh.md` |
| `docs/reference/architecture-gates.md` | `docs/reference/architecture-gates.zh.md` |
| `docs/architecture/caption-meet-architecture.md` | `docs/architecture/caption-meet-architecture.zh.md` |

When you add a new **authoritative** English doc that maintainers expect in both languages, add its path to `REQUIRED_CHINESE_PAIRS` and add the `.zh.md` file in the same change (or mark Chinese `Stale` until synced).

**Not in the required list (examples):** `ACTIVE.md` (session state, often English-first), optional playbooks such as `docs/guides/agent/typescript.md`, ADRs under `docs/decisions/` (English authoritative; `.zh.md` optional but recommended for 0001+), and everything under **`third_party/`** (vendor upstream; not part of CaptionMeet doc i18n).

## Excluded from doc scans

`IGNORE_DIR_NAMES` in `docs-i18n-config.mjs` includes `third_party`. Do not add `third_party/RTCPilot/**` to required pairs; keep RTCPilot attribution in `LICENSE` / `UPSTREAM.md` instead.

## Translation lifecycle (Chinese `*.zh.md`)

1. **Machine Draft** — First pass. Use 原文版本 `Uncommitted baseline` until the English page is stable enough to pin.
2. **Human Reviewed** — A maintainer read the Chinese for clarity and tone. Set 原文版本 to the **full git commit** of the English file reviewed (`git rev-parse HEAD -- <path>`), and update **最近同步** to the review date.
3. **Technically Verified** — Optional: after a substantive English edit, re-ran `npm run docs:verify` and confirmed headings, links, and non-localized fences still match.
4. **Stale** — English changed after the recorded 原文版本; update Chinese or mark `Stale` until fixed. `docs:i18n:check` reports drift unless status is `Stale`.

Do not bulk-promote every file to `Human Reviewed` without reading it. Prioritize P0 paths: root `README`, `AGENTS`, PRD, architecture, `agent-collaboration`.

## Code fences in translations

`docs:i18n:check` compares fenced blocks in each required pair (**same count, same order**).

| Fence tag | When to use | Body must match English? |
|-----------|-------------|---------------------------|
| `bash`, `json`, `typescript`, … | Commands, config, APIs | **Yes** |
| `text` | Paths, literals, portable ASCII | **Yes** (warning if mismatch) |
| `text prompt` | Copy-paste maintainer chat prompts | **No** — tag **both** en/zh at the **same index** |
| `text localized` | Diagrams with translated labels, same repo paths | **No** — keep path tokens identical; tag **both** sides |

Example (both languages use `text prompt` at the same fence index):

```text prompt
Continue CaptionMeet. @ ACTIVE.md only.
```

If a fence body may differ by language, both sides must use the same modifier (`prompt` or `localized`). Unmarked fences should stay identical unless you intentionally localize with `localized`.

## Maintainer workflow

1. Edit the **English** authoritative file.
2. Update the matching `*.zh.md` (or set 翻译状态 to `Stale` and fix in a follow-up).
3. Run `npm run docs:verify` before closing a doc-heavy session.
4. Commit messages stay **English** per [`git-commit-convention.md`](git-commit-convention.md).

## Scope

This guide applies to **repository documentation**, not in-app UI strings. Define product UI language and copy in [`product-requirements.md`](product-requirements.md) when user-visible work is `Accepted`.
