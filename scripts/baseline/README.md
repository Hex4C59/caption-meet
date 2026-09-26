# WI-002 Browser Media Fixture

This is an integration test, not the meeting application. Three independent
Chrome processes publish synthetic tones and animated canvas tracks through
RTCPilot. The fixture imports the pinned upstream `PCWrap` and
`ProtooClientWrap`; it does not implement its own SDP or protoo stack.

## Preparation

Run from the repository root with Node 22 and npm. Preserve existing directories;
use alternate `WI002_CLIENT` / `WI002_DRIVER` paths if these already exist.

```bash
git clone https://github.com/runner365/webrtc_js_client.git build/wi002-browser/upstream
git -C build/wi002-browser/upstream checkout --detach e08c241f2f80518ebe1138d2127215bb11a52a61
npm --prefix build/wi002-browser/upstream ci --ignore-scripts --no-audit --no-fund
npm install --prefix build/wi002-browser/driver --save-exact --ignore-scripts --no-audit --no-fund playwright-core@1.62.1
node build/wi002-browser/driver/node_modules/playwright-core/cli.js install chromium
```

The upstream client is MIT licensed; its original `LICENSE` and source remain
in the checkout. Its original UI starts with:

```bash
npm --prefix build/wi002-browser/upstream run dev -- --host 127.0.0.1 --port 18082 --strictPort
```

At the pinned revision, `npm run build` fails with TypeScript errors in `App.vue`
and a missing Promise return in `PCWrap.setRemoteDescription`. The fixture uses
Vite development transpilation; this does not claim a successful upstream type
check or production build. It awaits the native peer connection's
`setRemoteDescription` Promise, and installs track listeners before negotiation.
All other upstream publish/subscribe and protoo helpers remain unchanged.

## Run

Start the separately built RTCPilot with its isolated baseline configuration:
signaling `ws://127.0.0.1:18080/webrtc`, media candidate `127.0.0.1:18000`, optional
services and VoiceAgent disabled. Generate a fresh config and start the SFU:

```bash
node scripts/baseline/prepare-config.mjs build/rtcpilot-meeting-baseline/run
build/rtcpilot-meeting-baseline/RTCPilot build/rtcpilot-meeting-baseline/run/config.json
```

The generator accepts an alternative run directory and refuses to overwrite an
existing `config.json`. It uses the repository's development DTLS certificate;
this is not a LAN or production certificate setup. Start the fixture separately:

```bash
node scripts/baseline/serve.mjs
```

Run two browsers, add a third, reconnect signaling without replacing media,
check exit and prompt same-ID rejoin plus later notifications, and observe
three-party media for ten minutes:

```bash
WI002_SOAK_SECONDS=600 timeout --kill-after=10s 900s node scripts/baseline/run-browser.mjs
```

`WI002_CHROME` selects an existing Chrome executable. The runner keeps its
sandbox enabled and does not disable certificate validation, web security, or
autoplay policies. A real button click activates the synthetic audio context.
The page is a secure context because it is served on loopback; this does not
validate LAN HTTPS/WSS, real microphones, cameras, loudspeakers or permissions.
Headless Chrome's default `--mute-audio` mutes system output; the assertions
measure remote decoded PCM digitally and do not claim human listening.

Optional environment variables:

- `WI002_OUTPUT`: new evidence directory; default is timestamped under ignored `build/`.
- `WI002_BROWSER_COUNT=2`: stop at the two-browser stage.
- `WI002_REJOIN_TARGET=bob`: with two browsers, run the minimized same-ID rejoin regression.
- `WI002_REJOIN=0`: omit the separate exit/rejoin regression for a clean media soak.
- `WI002_CAPTURE_AUDIO=1`: save two seconds of Alice's actual received Bob audio
  track as PCM WAV plus sample-rate, duration, energy and frequency metadata.
  This is only for these synthetic test tones, not participant recordings.
- `WI002_WAIT_FOR_SERVER_STOP=1`: after media checks, write `ready-to-stop.json`
  and allow 90 seconds for the operator to stop the SFU; record browser observation.

Each direction must show remote decoded PCM energy and the correct test tone
(440, 660 or 880 Hz), changing rendered video pixels, increasing received audio
and video bytes, increasing decoded video frames, and connected DTLS. The runner
saves stats, screenshots, errors and explicit client resource cleanup to
`result.json`. An error exits nonzero and preserves the failed observations.

Client cleanup closes peer connections, stops tracks and oscillator/timers,
disconnects audio nodes and closes signaling. Server resource expiry, port
release and process shutdown must be measured separately. Multi-browser results
do not replace the required three-physical-computer acceptance.

The focused [pre-STUN lifetime regression](PRE-STUN.md) adds real-signaling expiry,
direct object/index/timer observation, a standalone C++ test and sanitizer commands.

The [trusted LAN fixture](LAN.md) adds HTTPS/WSS, private LAN candidates, isolated
browser trust and camera/microphone preview before joining. It retains this
loopback mode. `WI002_PAGE_URL` and `WI002_SIGNALING_URL` select its endpoints;
`WI002_MEDIA_MODE=devices` selects native capture. Real-device mode exports only
statistics, never WAV recordings or video screenshots. Physical-computer and
human listening acceptance remain separate from synthetic or fake-device runs.
