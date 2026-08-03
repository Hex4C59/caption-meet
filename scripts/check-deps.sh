#!/usr/bin/env bash
# Verify in-tree RTCPilot vendor copy (see docs/decisions/0001-vendor-rtcpilot-in-tree.md).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RTC="$ROOT/third_party/RTCPilot"
echo "CaptionMeet root: $ROOT"
echo "Expected RTCPilot: $RTC"
ls -d "$RTC" >/dev/null
echo "RTCPilot found: $RTC"
if [ ! -f "$RTC/LICENSE" ]; then
  echo "ERROR: missing $RTC/LICENSE (upstream attribution)." >&2
  exit 1
fi
if [ ! -f "$RTC/UPSTREAM.md" ]; then
  echo "ERROR: missing $RTC/UPSTREAM.md (provenance record)." >&2
  exit 1
fi
if [ -d "$RTC/src/webrtc_room/voice_agent" ]; then
  echo "voice_agent sources present."
else
  echo "WARN: expected voice_agent dir missing under RTCPilot." >&2
  exit 1
fi
