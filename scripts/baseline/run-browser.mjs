import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const runtime = path.resolve(process.env.WI002_DRIVER ?? path.join(repoRoot, 'build/wi002-browser/driver'));
const { chromium } = await import(pathToFileURL(path.join(runtime, 'node_modules/playwright-core/index.mjs')));
const executablePath = process.env.WI002_CHROME ?? chromium.executablePath();
const duration = Number(process.env.WI002_SOAK_SECONDS ?? 0);
const count = Number(process.env.WI002_BROWSER_COUNT ?? 3);
const pageUrl = new URL(process.env.WI002_PAGE_URL ?? 'http://127.0.0.1:18081/browser.html');
const mediaMode = process.env.WI002_MEDIA_MODE ?? pageUrl.searchParams.get('media') ?? 'synthetic';
const signalingUrl = process.env.WI002_SIGNALING_URL ?? pageUrl.searchParams.get('endpoint');
const fakeDevices = process.env.WI002_FAKE_DEVICES === '1';
assert(['http:', 'https:'].includes(pageUrl.protocol), 'page URL must use HTTP or HTTPS');
assert(['synthetic', 'devices'].includes(mediaMode), 'media mode must be synthetic or devices');
assert([2, 3].includes(count), 'browser count must be two or three');
assert(Number.isFinite(duration) && duration >= 0, 'soak duration must be nonnegative');
assert(mediaMode !== 'devices' || process.env.WI002_CAPTURE_AUDIO !== '1', 'real-device mode never records audio');
const output = path.resolve(process.env.WI002_OUTPUT ?? path.join(repoRoot, `build/wi002-browser/evidence/run-${Date.now()}`));
const room = `wi002-${Date.now()}`;
const peers = [];
const tones = { alice: 440, bob: 660, charlie: 880 };
const report = { started: new Date().toISOString(), room, executablePath, duration, pageUrl: pageUrl.href,
  signalingUrl, mediaMode, fakeDevices, evidenceScope: 'independent local browser processes, not physical computers',
  phases: [], cleanup: [] };
await fs.mkdir(output, { recursive: true });
await fs.writeFile(path.join(output, 'result.json'), '{}\n', { flag: 'wx' });

async function save() {
  await fs.writeFile(path.join(output, 'result.json'), JSON.stringify(report, null, 2));
}

async function addPeer(user) {
  const browser = await chromium.launch({ executablePath, headless: true, chromiumSandbox: true,
    args: fakeDevices ? ['--use-fake-device-for-media-stream'] : [] });
  const context = await browser.newContext({ viewport: { width: 1120, height: 760 } });
  if (mediaMode === 'devices') await context.grantPermissions(['camera', 'microphone'], { origin: pageUrl.origin });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const peer = { user, browser, page, errors };
  peers.push(peer);
  report.browserVersion ??= browser.version();
  await openPeer(peer);
  return peer;
}

async function waitState(peer, predicate, label, timeout = 30000) {
  const deadline = Date.now() + timeout;
  let state;
  do {
    state = await peer.page.evaluate(() => window.baseline.snapshot());
    if (state.errors.length) throw new Error(state.errors.join('; '));
    if (predicate(state)) return;
    await delay(100);
  } while (Date.now() < deadline);
  throw new Error(label + ' timed out: ' + JSON.stringify(state));
}

async function openPeer(peer) {
  const url = new URL(pageUrl);
  for (const [key, value] of Object.entries({ user: peer.user, room, frequency: tones[peer.user], media: mediaMode })) {
    url.searchParams.set(key, value);
  }
  if (signalingUrl) url.searchParams.set('endpoint', signalingUrl);
  await peer.page.goto(url.href);
  await peer.page.waitForFunction(() => window.baseline, null, { timeout: 10000 });
  await peer.page.locator('#start').click();
  if (mediaMode === 'devices') {
    await waitState(peer, (state) => state.captureState === 'preview', 'Capture preview', 35000);
    await peer.page.locator('#join').click();
  }
  await waitState(peer, (state) => state.publisher?.connection === 'connected', 'Connected publisher');
}

async function snapshots(activePeers) {
  return Promise.all(activePeers.map(async (peer) => ({
    ...await peer.page.evaluate(() => window.baseline.snapshot()), pageErrors: [...peer.errors],
  })));
}

async function awaitMedia(activePeers) {
  const end = Date.now() + 30000;
  let states;
  do {
    states = await snapshots(activePeers);
    if (states.every((state) => activePeers.filter((peer) => peer.user !== state.userId).every((peer) => {
      const remote = state.remotes.find((entry) => entry.userId === peer.user);
      return remote?.stats?.connection === 'connected' && remote.audio &&
        (mediaMode === 'devices' || remote.audio.rms > 0.005) && remote.video?.totalVideoFrames > 2;
    }))) return;
    if (states.some((state) => state.errors.length || state.pageErrors.length)) break;
    await delay(500);
  } while (Date.now() < end);
  report.failedStates = states;
  await save();
  throw new Error(`Remote decoded audio/video did not become ready for ${activePeers.length} peers`);
}

function mediaReport(remote, kind) {
  return remote.stats.reports.find((item) => item.type === 'inbound-rtp' && item.kind === kind);
}

async function verifyPhase(name, activePeers) {
  await awaitMedia(activePeers);
  const before = await snapshots(activePeers);
  await delay(2200);
  const after = await snapshots(activePeers);
  const phase = { name, before, after, passed: false };
  report.phases.push(phase);
  for (const state of after) {
    assert.equal(state.secureContext, true, 'page must be a normally trusted secure context');
    assert.deepEqual(state.errors, [], `${state.userId} fixture errors`);
    assert.deepEqual(state.pageErrors, [], `${state.userId} page errors`);
    for (const stats of [state.publisher, ...state.remotes.map((remote) => remote.stats)]) {
      for (const item of stats?.reports ?? []) {
        assert(!Object.hasOwn(item, 'usernameFragment') && !Object.hasOwn(item, 'iceLocalUsernameFragment'),
          'exported statistics must omit ICE credential fragments');
      }
    }
    for (const peer of activePeers.filter((entry) => entry.user !== state.userId)) {
      const current = state.remotes.find((remote) => remote.userId === peer.user);
      const previous = before.find((entry) => entry.userId === state.userId).remotes.find((remote) => remote.userId === peer.user);
      if (mediaMode === 'synthetic') {
        assert(current.audio.rms > 0.005, `${state.userId} <- ${peer.user}: remote PCM energy`);
        assert(Math.abs(current.audio.peakHz - tones[peer.user]) < 20, `${state.userId} <- ${peer.user}: remote tone identity`);
        assert.notEqual(current.video.hash, previous.video.hash, 'remote video pixels must change');
      } else {
        assert.equal(current.video.hash, undefined, 'device images must not be sampled or exported');
        assert.equal(current.audio.peakHz, undefined, 'device audio exports contain aggregate energy only');
      }
      assert(current.audio.playing, 'remote playback element must be playing');
      assert(current.video.totalVideoFrames > previous.video.totalVideoFrames, 'remote rendered frame count must increase');
      for (const kind of ['audio', 'video']) {
        const now = mediaReport(current, kind);
        const earlier = mediaReport(previous, kind);
        assert(now?.bytesReceived > earlier?.bytesReceived, `${state.userId} <- ${peer.user}: ${kind} byte delta`);
        if (kind === 'video') assert(now.framesDecoded > earlier.framesDecoded, 'decoded video frame delta');
      }
      assert(current.stats.reports.some((item) => item.type === 'transport' && item.dtlsState === 'connected'), 'DTLS connected');
    }
  }
  phase.passed = true;
  await save();
  console.log(JSON.stringify({ phase: name, passed: true, participants: activePeers.map((peer) => peer.user), at: new Date().toISOString() }));
}

try {
  await addPeer('alice');
  await addPeer('bob');
  await verifyPhase('two-browsers', peers);
  if (count === 2 && process.env.WI002_REJOIN_TARGET === 'bob') {
    report.secondLeave = await peers[1].page.evaluate(() => window.baseline.leave());
    await delay(1500);
    await openPeer(peers[1]);
    await verifyPhase('two-browser-same-id-rejoin', peers);
  }
  if (count === 3) {
    const third = await addPeer('charlie');
    await verifyPhase('three-browsers', peers);
    if (mediaMode === 'synthetic') {
      for (const peer of peers) await peer.page.screenshot({ path: path.join(output, `${peer.user}-three.png`) });
    }
    await peers[0].page.evaluate(() => window.baseline.reconnectSignal());
    await verifyPhase('signaling-only-reconnect', peers);
    if (process.env.WI002_REJOIN !== '0') {
      report.thirdLeave = await third.page.evaluate(() => window.baseline.leave());
      await delay(1500);
      await verifyPhase('others-continue-after-third-leaves', peers.slice(0, 2));
      await openPeer(third);
      await verifyPhase('same-id-rejoin', peers);
      report.secondLeave = await peers[1].page.evaluate(() => window.baseline.leave());
      await openPeer(peers[1]);
      await verifyPhase('notification-after-rejoin', peers);
    }
  }
  const soakStarted = Date.now();
  report.soakStarted = new Date(soakStarted).toISOString();
  console.log(JSON.stringify({ phase: 'soak-start', duration, at: report.soakStarted, output }));
  while ((Date.now() - soakStarted) / 1000 < duration) {
    await delay(Math.min(30000, Math.max(0, duration * 1000 - (Date.now() - soakStarted))));
    await verifyPhase('soak-sample', peers);
  }
  report.soakElapsedSeconds = (Date.now() - soakStarted) / 1000;
  if (process.env.WI002_CAPTURE_AUDIO === '1') {
    const { captureRemoteAudio } = await import('./capture-remote-audio.mjs');
    report.remoteAudio = await captureRemoteAudio(peers[0].page, output);
    await save();
    console.log(JSON.stringify({ phase: 'remote-audio-captured', ...report.remoteAudio }));
  }
  if (process.env.WI002_WAIT_FOR_SERVER_STOP === '1') {
    await fs.writeFile(path.join(output, 'ready-to-stop.json'), JSON.stringify({ at: Date.now() }));
    console.log(JSON.stringify({ phase: 'ready-to-stop-server', output }));
    const deadline = Date.now() + 90000;
    while (Date.now() < deadline) {
      const states = await snapshots(peers);
      if (states.every((state) => ['closed', 'disconnected'].includes(state.signalState))) {
        report.afterServerStop = states;
        break;
      }
      await delay(1000);
    }
    assert(report.afterServerStop, 'server stop must be observed by every browser');
  }
  report.passed = true;
} catch (error) {
  report.passed = false;
  report.failure = error.stack;
  report.lastStates = await snapshots(peers).catch(() => []);
  console.error(error);
  process.exitCode = 1;
} finally {
  for (const peer of peers) {
    try {
      const cleanup = await peer.page.evaluate(() => window.baseline.leave());
      report.cleanup.push(cleanup);
      assert(cleanup.peers.every((state) => state === 'closed'));
      assert(cleanup.tracks.every((state) => state === 'ended'));
      assert.equal(cleanup.audioContext, 'closed');
      assert.equal(cleanup.signaling, 'new');
    } catch (error) {
      report.cleanup.push({ userId: peer.user, failure: String(error) });
      report.passed = false;
      process.exitCode = 1;
    }
    await peer.browser.close();
  }
  report.ended = new Date().toISOString();
  await save();
  console.log(JSON.stringify({ output, passed: report.passed }));
}
