# CaptionMeet

English | [中文](README.zh.md)

- Type: Guide
- Status: Accepted
- Created: 2026-09-21
- Updated: 2026-10-14
- Authority: product repository entry point

**CaptionMeet** targets three-person LAN audio/video meetings with per-participant Chinese live captions in desktop Chrome. On 2026-10-14, the maintainer chose Rust for all maintained application code and requested C++ removal as the first step; see [ADR 0002](docs/decisions/0002-rust-source-transition.md).

## Current state

The C/C++ SFU implementation, native tests, bundled native dependencies, build projects and native artifacts have been removed. **No Rust application or runnable SFU has been implemented by this cleanup.** Browser UI and business service directories remain placeholders; Rust libraries and frameworks remain unselected.

Existing JavaScript/Python tools and fixtures remain for later migration. Previous C++ architecture, configuration and reports are historical references, not current build or Rust acceptance evidence. WI-004 was superseded without physical-device acceptance; see [ACTIVE](ACTIVE.md).

## Documentation

- Current work and authorization: [ACTIVE](ACTIVE.md).
- Product scope, still Draft: [PRD](docs/product-requirements.md).
- Rust transition and historical C++ design: [architecture](docs/architecture/caption-meet-architecture.md).
- Agent instructions and navigation: [AGENTS](AGENTS.md), [documentation index](docs/README.md).

## Historical upstream references

RTCPilot supplied the removed C++ SFU. Its [MIT license](third_party/RTCPilot/LICENSE), [import provenance](third_party/RTCPilot/UPSTREAM.md), bundled dependency notices and protocol/configuration documentation remain under `third_party/RTCPilot/`. This is no longer a buildable vendor copy.

VoiceAgent remains an external speech-runtime reference. Recognition-only suitability, three-input isolation and replacement integration are unverified; no ASR/LLM/TTS runtime is implemented here. Credentials belong outside browser bundles and storage, and meeting media must still pass through an SFU.

## Layout

```text
caption-meet/
├── ACTIVE.md / AGENTS.md
├── apps/web/          # placeholder
├── server/            # placeholder
├── third_party/RTCPilot/  # historical docs, provenance and licenses
├── docs/
└── scripts/           # existing tooling; Rust migration pending
```

## Checks

```bash
npm test
npm run docs:verify
npm run check:deps
```

These check existing tooling, documentation and source cleanup; they do not build or validate a Rust product. Documentation scans exclude Git-ignored local skills under `.agents`; repository links and English/Chinese pairs remain checked.

## Acknowledgments

Thanks to the authors and contributors of RTCPilot and VoiceAgent. Historical source and license attribution are retained.
