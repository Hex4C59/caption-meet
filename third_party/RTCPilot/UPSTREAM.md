# RTCPilot upstream record (CaptionMeet vendor copy)

This directory is a **vendored copy** of [RTCPilot](https://github.com/runner365/RTCPilot) for in-repository development and customization. It is not the official upstream repository.

## Source

| Field | Value |
|-------|--------|
| Upstream URL | https://github.com/runner365/RTCPilot.git |
| Imported commit | `b0fb2c4f24cea5e4f5c4b3f84c342857bc7645d8` |
| Import date | 2026-09-21 |
| License | See `LICENSE` in this directory (MIT) |

## CaptionMeet policy

- SFU and `voice_agent` changes are made **here** (`third_party/RTCPilot/`), not in a sibling `../RTCPilot` checkout.
- Preserve upstream copyright and license notices when modifying files.
- Optional: record major divergence from upstream commit in this file or in `docs/decisions/`.

## Build artifacts

Do not commit `build/`, `artifacts/`, or other generated output (see repository root `.gitignore`).
