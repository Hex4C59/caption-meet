# CaptionMeet

English | [中文](README.zh.md)

- Type: Guide
- Status: Accepted
- Created: 2026-09-21
- Authority: product repository entry point

**CaptionMeet** is being developed into a **three-person audio/video meeting tool with Chinese live captions**, for desktop Chrome on one LAN. The maintainer confirmed this direction on 2026-09-26 to build C++ RTC server experience. The browser product remains unimplemented; media uses the in-tree RTCPilot SFU.

## Documentation

Workflow and the current work item: [`docs/README.md`](docs/README.md), [`AGENTS.md`](AGENTS.md), [`ACTIVE.md`](ACTIVE.md).

Product scope (Draft PRD): [`docs/product-requirements.md`](docs/product-requirements.md). Architecture: [`docs/architecture/caption-meet-architecture.md`](docs/architecture/caption-meet-architecture.md).

## Upstream open source

This product builds on upstream projects. Respect their licenses and attribution:

| Upstream | Role | License | Repository |
|----------|------|---------|------------|
| **RTCPilot** | WebRTC SFU: rooms, media forwarding, `voice_agent` integration | MIT | [github.com/runner365/RTCPilot](https://github.com/runner365/RTCPilot) |
| **VoiceAgent** | Real-time voice agent (ASR / LLM / TTS, etc.) | See upstream | [github.com/runner365/VoiceAgent](https://github.com/runner365/VoiceAgent) |

**RTCPilot** is vendored at [`third_party/RTCPilot/`](third_party/RTCPilot/) (MIT; see `LICENSE` and `UPSTREAM.md`). SFU changes are made in this repository. **VoiceAgent** remains a separate deployable service configured through RTCPilot.

## Repository responsibilities

| Part | Responsibility |
|------|----------------|
| **This repo** | Meeting UI/lifecycle and per-participant live captions (planned) |
| `third_party/RTCPilot` | Join room, media path, VoiceAgent wiring (in-tree fork) |
| VoiceAgent | External speech runtime; recognition-only suitability for meetings remains to be verified |

## Layout (bootstrap)

```
caption-meet/
├── README.md
├── ACTIVE.md / AGENTS.md
├── third_party/
│   └── RTCPilot/      # vendored SFU (MIT)
├── docs/
├── apps/web/          # browser client (placeholder)
├── server/            # thin business API (placeholder)
└── scripts/           # local dev / doc checks
```

The name **CaptionMeet** combines live captions and meetings. This checkout was renamed from `voice-coach` to `caption-meet` on 2026-09-26. A local `voice-coach -> caption-meet` compatibility symlink preserves absolute paths in existing build caches, development TLS configuration and recorded experiment artifacts. Use `caption-meet` for new work; keep the symlink while reusing those artifacts.

## Status

The meeting scope is confirmed and the PRD remains Draft. WI-002 has measured Debug build, direct test and two/three-browser media results, including a focused rejoin repair; this is not a shipped meeting product or three-computer acceptance. See `ACTIVE.md`, the [execution report](docs/reports/2026-09-26-meeting-baseline.md) and the [baseline plan](docs/plans/meeting-baseline-spike.md).

## Checks

```bash
npm run docs:verify
npm run check:deps
```

## Acknowledgments

Thanks to the authors and contributors of [RTCPilot](https://github.com/runner365/RTCPilot) and [VoiceAgent](https://github.com/runner365/VoiceAgent). This repository is an application layer on top of their work.
