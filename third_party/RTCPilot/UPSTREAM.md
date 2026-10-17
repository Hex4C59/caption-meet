# RTCPilot upstream record (CaptionMeet vendor copy)

This directory retains the historical import record and attribution for the former [RTCPilot](https://github.com/runner365/RTCPilot) vendor copy. On 2026-10-14, its C/C++ implementation, native dependencies, build projects and artifacts were removed under [ADR 0002](../../docs/decisions/0002-rust-source-transition.md). It is no longer a buildable source copy or the official upstream repository.

## Source

| Field | Value |
|-------|--------|
| Upstream URL | https://github.com/runner365/RTCPilot.git |
| Imported commit | `b0fb2c4f24cea5e4f5c4b3f84c342857bc7645d8` |
| Import date | 2026-09-21 |
| License | See `LICENSE` in this directory (MIT) |

## CaptionMeet policy

- Future maintained implementation uses Rust; this directory preserves historical documents and attribution. The removed native source remains in Git history.
- Preserve upstream copyright and license notices when modifying files.
- Optional: record major divergence from upstream commit in this file or in `docs/decisions/`.

## Build artifacts

Do not commit `build/`, `artifacts/`, or other generated output (see repository root `.gitignore`).
