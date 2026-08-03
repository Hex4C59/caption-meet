# ADR 0001: Vendor RTCPilot under `third_party/RTCPilot`

English | [中文](0001-vendor-rtcpilot-in-tree.zh.md)

- Type: Architecture decision
- Status: Accepted
- Created: 2026-09-21
- Gate: `gate-repo-layout`

## Context

CaptionMeet needs a customizable WebRTC SFU with `voice_agent` integration. The maintainer prefers to evolve RTCPilot **inside this repository** rather than maintaining a sibling checkout and submitting changes upstream via pull requests.

## Decision

1. Keep a full RTCPilot source tree at **`third_party/RTCPilot/`** (excluding `.git` and local build output).
2. Record provenance in **`third_party/RTCPilot/UPSTREAM.md`** (upstream URL, imported commit, date).
3. Retain RTCPilot **LICENSE** and attribution in product README; modifications are CaptionMeet-maintained forks of upstream files.
4. **`scripts/check-deps.sh`** validates the in-tree path, not `../RTCPilot`.
5. VoiceAgent remains an external deployable service unless a future ADR says otherwise.

## Consequences

- Clone size increases (~100MB+ source); CI must not require committing `build/` under `third_party/RTCPilot`.
- Agents and docs treat `third_party/RTCPilot` as the **authoritative SFU codebase** for this product.
- Syncing with upstream RTCPilot is manual (re-import or merge), documented in `UPSTREAM.md` when performed.

## Alternatives considered

- Sibling `../RTCPilot` only — rejected by maintainer workflow preference.
- Git submodule — rejected; maintainer wants a plain copy in-tree.
