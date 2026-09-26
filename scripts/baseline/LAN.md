# Trusted LAN Media Fixture (WI-004)

This uses the same pinned browser helpers and RTCPilot as [README](README.md).
It is a trusted-LAN development fixture, without product admission controls.
HTTPS/WSS does not authenticate meeting membership. Physical-computer acceptance
is separate from automated browsers running on this machine.

## Local checkout rename (2026-09-26)

The checkout is now `/home/aimsl/code/Cpp/caption-meet`. The sibling
`voice-coach -> caption-meet` symlink keeps existing CMake caches, binary library
paths and TLS/config paths reachable. Retained evidence and issued certificates
still contain the original name. Configure new builds in a new build directory
under the canonical checkout; when reusing an old CMake cache, use its original
absolute source/build paths through the compatibility symlink.

Prepare a new isolated trust directory for future runs: the trust check compares
the manifest path with the canonical directory, so old trust manifests cannot be
reused unchanged. To reuse the retained physical-device wizard, invoke it as
`bash /home/aimsl/code/Cpp/voice-coach/build/wi004-physical-20260926/device-acceptance.sh`
so its lexical directory check agrees with the original run manifest. The normal
device, network, certificate-expiry and trust prerequisites below still apply.

## Prepare

Use Node 22, OpenSSL, the pinned client/Playwright dependencies from README and a
Debug SFU. Select a private IPv4 assigned to the server, not a Docker/Tailscale or
loopback address unless that is the actual intended test network. Inspect local
interfaces first; do not change the firewall or router automatically.

```bash
ip -brief -4 addr
cmake -S third_party/RTCPilot -B build/wi004-debug -DCMAKE_BUILD_TYPE=Debug
cmake --build build/wi004-debug --parallel 4
node scripts/baseline/prepare-lan.mjs build/wi004/run --ip 10.10.16.135
```

The example IP was assigned to the test machine on 2026-09-26. Substitute the
actual LAN address. The generator requires a **new** run directory, never
overwrites existing evidence, and accepts `--candidate-ip`, `--page-port`,
`--signal-port` and `--media-port`. Defaults are HTTPS 19081, WSS 19080 and UDP
19000. The original `prepare-config.mjs` CLI retains loopback ports 18080/18000.

`run/lan.json` records URLs, SAN, fingerprints, certificate expiry and config
paths. Certificates last seven days; use a fresh run directory and trust setup
after expiry or an IP change. The public `run/ca.crt` is the **only** trust file
needed by another computer. Never transfer `tls/ca.key` or `tls/server.key`.
Check the CA fingerprint over the existing trusted communication channel.

The leaf certificate covers the exact LAN IP. The same leaf secures the page
and native SFU WSS. WSS uses nested `websocket_server.cert_path/key_path`;
top-level certificate paths remain the separate upstream WebRTC DTLS fixture.
The generated LAN config disables VoiceAgent, ASR and unrelated listeners;
text logging is warn-level and structured SFU event logs go to `/dev/null`.
Browser evidence contains statistics, not recordings.

## Start and Stop

Start these foreground commands in separate terminals:

```bash
build/wi004-debug/RTCPilot build/wi004/run/config.json
node scripts/baseline/serve-lan.mjs build/wi004/run/lan.json
```

The HTTPS server bundles only `browser.html` and its imports using the pinned
Vite installation. It serves an in-memory map of build outputs, with no static
filesystem mapping or Vite development endpoints. Private files, the manifest,
config, source maps and `/@fs` paths are not available over HTTP. This is a fixture
bundle build, not a successful type check of the upstream Vue application.

The retained loopback Vite server also limits its filesystem allowlist to the
fixture and pinned upstream checkout. It must not allow the whole repository,
because that would expose generated TLS files through its development routes.

Stop both with Ctrl-C after the test. The HTTPS server closes its connections;
RTCPilot process termination is **not** proof of graceful application shutdown.
Check only the chosen ports and owned processes:

```bash
ss -lntup | rg ':(19000|19080|19081)\b'
```

## Isolated Automatic Trust

On the tested Linux Chrome 151, an existing `~/.pki/nssdb` overrides the XDG
database. The helper refuses that situation. Otherwise it creates a new database
under the repository's ignored `build/` directory. It never changes `HOME`,
existing user databases or system certificate stores. A new Chrome profile alone
is insufficient to isolate NSS trust.

`certutil` is required. WI-004 downloaded Ubuntu `libnss3-tools`
`2:3.98-1ubuntu0.2` and extracted it locally, without installing a system package.
The helper accepts `/usr/bin/certutil`, the existing local extraction at
`build/wi004/tools/usr/bin/certutil`, or an explicit `WI004_CERTUTIL` executable.

```bash
node scripts/baseline/prepare-browser-trust.mjs build/wi004/run/ca.crt build/wi004/trust-data
timeout --kill-after=5s 60s node scripts/baseline/check-browser-trust.mjs \
  build/wi004/run/lan.json build/wi004/trust-data build/wi004/evidence/trust-repeat
node scripts/baseline/check-lan.mjs build/wi004/run/lan.json build/wi004/evidence/tls-repeat
```

Each evidence directory must be new. The browser test proves untrusted CA
rejection followed by a normally trusted HTTPS secure context and native WSS
connection, and compares existing trust database metadata before/after. The
HTTP/TLS test additionally rejects a wrong hostname and probes private-file
paths. Neither test ignores certificate errors or disables browser security.
The Linux path behavior is documented in the [Chromium certificate guide](https://chromium.googlesource.com/chromium/src.git/+/refs/heads/main/docs/linux/cert_management.md)
and [NSS path implementation](https://chromium.googlesource.com/chromium/src/+/HEAD/crypto/nss_util.cc);
the runtime positive/negative controls verify the actual installed browser.

## Automated Media and Device States

Set `XDG_DATA_HOME` only for each test command, using its absolute path:

```bash
XDG_DATA_HOME="$PWD/build/wi004/trust-data" \
WI002_PAGE_URL=https://10.10.16.135:19081/browser.html \
WI002_SIGNALING_URL=wss://10.10.16.135:19080/webrtc \
WI002_SOAK_SECONDS=45 WI002_OUTPUT=build/wi004/evidence/lan-media-repeat \
  timeout --kill-after=10s 180s node scripts/baseline/run-browser.mjs

XDG_DATA_HOME="$PWD/build/wi004/trust-data" \
WI002_PAGE_URL=https://10.10.16.135:19081/browser.html \
WI002_SIGNALING_URL=wss://10.10.16.135:19080/webrtc \
WI004_JOIN_TEST=1 WI004_PERMISSION_OUTPUT=build/wi004/evidence/permissions-repeat \
  timeout --kill-after=10s 180s node scripts/baseline/test-device-capture.mjs
```

Synthetic media retains frequency, decoded PCM, changing pixel/frame and RTP
assertions in every remote direction. `WI002_MEDIA_MODE=devices` selects native
capture; `WI002_FAKE_DEVICES=1` explicitly requests Chrome test hardware. Fake
hardware and injected failures test the capture workflow, not physical devices.
The permission test separates native permission/capture results from controlled
unavailable/busy-device failures and late-result cancellation.

## Physical Computers

The generated manifest contains three distinct `devices[].url` values with the
same room and different user IDs. Each includes `media=devices` and the correct
WSS endpoint; use those URLs instead of omitting the endpoint on custom ports.
On each computer, use desktop Chrome and verify the public CA fingerprint before
adding temporary trust through a reviewed browser/OS-specific procedure. Never
bypass a certificate warning. Trust changes and their removal belong to the
human operator; no script silently imports into a system trust store.

1. Open the appropriate device URL without a certificate warning. Click **Preview
   camera and microphone**, grant the two requested permissions, and inspect the
   local preview. Preview must not publish or open meeting signaling.
2. Click **Join** on two different computers. Confirm both people hear the other
   and see a changing remote camera picture. Headphones help avoid acoustic feedback.
3. Add the third computer and check all six remote directions. On each computer,
   click **Collect 10-minute stats**, keep the call active for ten minutes, then
   **Export stats**. Collection is bounded; real capture is never recorded or
   converted to screenshots/pixel samples by the fixture.
4. Record device OS/Chrome versions, network setup, human listening/video findings,
   permission failures, exit/rejoin and signaling-reconnect observations. Compare
   exported candidate pairs, audio/video byte deltas and decoded frame deltas.
5. Click **Leave** on every computer. Check browser capture indicators stop, export
   final cleanup stats, stop the two server commands and remove temporary CA trust
   through the same reviewed procedure. Do not remove unrelated certificates.

The original wizard at `build/wi004/device-acceptance.sh` is historical evidence.
The [physical continuation](../../docs/reports/2026-09-26-physical-media-handoff.md)
prepared `build/wi004-physical-20260926/device-acceptance.sh` and the adjacent
`DEVICE-HANDOFF.md` with manifest-based URLs, Ubuntu/Windows trust scope/removal,
two-device counter/lifecycle review and raw JSON transfer. The maintainer's
Ubuntu/Windows computers were not on the same LAN, so no physical acceptance ran.
Use this new wizard only after rechecking its IP/certificate and actual device
conditions. It is not run by the agent and does not turn unperformed steps into
passes. Existing loopback README commands and
[WI-003 lifetime checks](PRE-STUN.md) remain independent regression paths.

For the post-soak checks, the selected remote candidate must match the SFU UDP
address, with growing audio/video bytes and decoded frames on each receiver.
Compare counters within the same RTP report ID/SSRC. Save the ten-minute JSON
before reconnecting. Leave and rejoin one device with the same URL/ID and check
both directions again. For signaling-only reconnect, manually enter
`await window.baseline.reconnectSignal()` in that page's browser console;
confirm media continues and export fresh stats. Keep browser security and
self-XSS protections enabled. The wizard records these observations separately.
