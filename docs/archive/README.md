# Archive (non-authoritative history)

English | [中文](README.zh.md)

- Type: Reference
- Status: Accepted
- Created: <!-- date -->
- Authority: **historical context only**—superseded PRDs, WIs, spikes, and discussions

## Purpose

Move material here when it is **no longer active** but you want to keep an audit trail:

- Superseded `product-requirements.md` revisions (link from the current PRD).
- Past WI proposals and session records that are too long for `ACTIVE.md`; unresolved work and effective constraints remain summarized in the live entry point.
- Abandoned spikes with lessons learned.

Do **not** implement from archive files. Agents treat archive as read-only background.

## Archived records

- [Session history before the 2026-09-26 cleanup](2026-09-26-active-history.md): original WI-001 through WI-004 proposals, authorization history and maintenance notes. Archiving these records does not accept work or close gates; [ACTIVE](../../ACTIVE.md) owns current continuation.
- [Historical coaching architecture](2026-09-26-coaching-architecture.md) ([Chinese](2026-09-26-coaching-architecture.zh.md)): the prior proposal, including single-human/AI assumptions and Practice APIs. The [current architecture](../architecture/caption-meet-architecture.md) identifies retained constraints and unresolved meeting design.

## Before moving a file

1. Note **why** it was superseded (one line at the top of the archived file or in an ADR).
2. Ensure the **current** truth lives in PRD (`Accepted`), architecture, gates, ADRs, or `ACTIVE.md`.
3. Prefer `YYYY-MM-DD-original-name.md` under `docs/archive/` (flat or subfolders by year).

## Agent rule

If archive text conflicts with current authoritative docs, ignore archive and cite the live file.
