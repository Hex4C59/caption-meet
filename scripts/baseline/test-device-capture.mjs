import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const runtime = path.resolve(process.env.WI002_DRIVER ?? path.join(root, 'build/wi002-browser/driver'));
const { chromium } = await import(pathToFileURL(path.join(runtime, 'node_modules/playwright-core/index.mjs')));
const url = new URL(process.env.WI002_PAGE_URL ?? 'http://127.0.0.1:18081/browser.html');
url.searchParams.set('media', 'devices');
url.searchParams.set('user', 'permission-test-' + Date.now());
url.searchParams.set('room', 'permission-test-' + Date.now());
if (process.env.WI002_SIGNALING_URL) url.searchParams.set('endpoint', process.env.WI002_SIGNALING_URL);
const output = path.resolve(process.env.WI004_PERMISSION_OUTPUT ?? path.join(root, 'build/wi004/evidence/permissions-' + Date.now()));
await fs.mkdir(output, { recursive: true });
await fs.writeFile(path.join(output, 'result.json'), '{}\n', { flag: 'wx' });
const report = { started: new Date().toISOString(), pageUrl: url.href,
  scope: 'native getUserMedia with Chrome fake capture hardware; not physical-device acceptance', phases: [] };
const browsers = [];
let watchdog;
let rejectAbort;
const aborted = new Promise((_, reject) => { rejectAbort = reject; });
const onSignal = (signal) => rejectAbort(new Error('Cancelled by ' + signal));
process.on('SIGINT', onSignal);
process.on('SIGTERM', onSignal);
const save = () => fs.writeFile(path.join(output, 'result.json'), JSON.stringify(report, null, 2));

async function run() {
  const browser = await chromium.launch({ executablePath: process.env.WI002_CHROME ?? chromium.executablePath(),
    headless: true, chromiumSandbox: true, handleSIGINT: false, handleSIGTERM: false,
    args: ['--use-fake-device-for-media-stream'] });
  browsers.push(browser);
  report.browserVersion = browser.version();
  const context = await browser.newContext();
  await context.grantPermissions([], { origin: url.origin });
  await context.addInitScript(() => {
    const capture = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    window.captureTest = { streams: [], calls: 0, failure: null, delayed: false, peers: 0 };
    navigator.mediaDevices.getUserMedia = async (...args) => {
      const state = window.captureTest;
      state.calls += 1;
      if (state.failure) throw new DOMException('Injected unavailable device', state.failure);
      const stream = await capture(...args);
      state.streams.push(stream);
      if (!state.delayed) return stream;
      return new Promise((resolve) => { state.resolve = () => resolve(stream); });
    };
    const Peer = window.RTCPeerConnection;
    window.RTCPeerConnection = class extends Peer {
      constructor(...args) { super(...args); window.captureTest.peers += 1; }
    };
  });
  const page = await context.newPage();
  const pageErrors = [];
  let signalingConnections = 0;
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('websocket', (socket) => { if (new URL(socket.url()).pathname === '/webrtc') signalingConnections += 1; });
  await page.goto(url.href);
  await page.waitForFunction(() => window.baseline, null, { timeout: 10000 });
  const state = () => page.evaluate(() => window.baseline.snapshot());
  async function waitState(predicate, label, timeout = 35000) {
    const deadline = Date.now() + timeout;
    let latest;
    do {
      latest = await state();
      if (predicate(latest)) return latest;
      await delay(100);
    } while (Date.now() < deadline);
    throw new Error(label + ' timed out: ' + JSON.stringify(latest));
  }
  const captureState = (expected) => waitState((current) => current.captureState === expected, 'Capture ' + expected);
  async function phase(name, details = {}) {
    assert.deepEqual(pageErrors, [], 'no uncaught browser errors');
    report.phases.push({ name, passed: true, at: new Date().toISOString(), ...details });
    await save();
    console.log(JSON.stringify({ phase: name, passed: true }));
  }
  async function assertNoPublication() {
    assert.equal(signalingConnections, 0, 'preview must not connect to signaling');
    assert.equal(await page.evaluate(() => window.captureTest.peers), 0, 'preview must not create a peer connection');
    assert.equal((await state()).publisher, null);
  }

  assert.equal((await state()).secureContext, true);
  await page.locator('#start').click();
  await captureState('error');
  const denied = await state();
  report.deniedState = denied;
  await save();
  assert.equal(denied.currentError?.code, 'NotAllowedError');
  assert.equal(await page.evaluate(() => window.captureTest.calls), 1);
  await assertNoPublication();
  await phase('native-permission-denied', { error: denied.currentError });

  await context.grantPermissions(['camera', 'microphone'], { origin: url.origin });
  await page.locator('#start').click();
  await captureState('preview');
  assert.deepEqual((await state()).localTracks.map((track) => track.kind).sort(), ['audio', 'video']);
  assert((await state()).localTracks.every((track) => track.state === 'live'));
  assert.deepEqual((await state()).errors, []);
  await assertNoPublication();
  await phase('permission-retry-preview-before-join');
  const previewCleanup = await page.evaluate(() => window.baseline.leave());
  assert.deepEqual(previewCleanup.tracks, ['ended', 'ended']);
  assert.equal(previewCleanup.audioContext, 'closed');
  await page.locator('#start').click();
  await captureState('preview');
  await assertNoPublication();
  await page.locator('#leave').click();
  await captureState('closed');
  await phase('preview-leave-preview-again');

  for (const name of ['NotFoundError', 'NotReadableError']) {
    await page.evaluate((value) => { window.captureTest.failure = value; }, name);
    await page.locator('#start').click();
    await captureState('error');
    assert.equal((await state()).currentError.code, name);
    await assertNoPublication();
    await phase('controlled-' + name, { scope: 'controlled error branch, not hardware failure', error: (await state()).currentError });
  }

  await page.evaluate(() => { window.captureTest.failure = null; window.captureTest.delayed = true; });
  await page.locator('#start').click();
  await page.waitForFunction(() => window.captureTest.resolve, null, { timeout: 10000 });
  await page.locator('#leave').click();
  await captureState('closed');
  await page.evaluate(() => window.captureTest.resolve());
  await delay(200);
  assert(await page.evaluate(() => window.captureTest.streams.every((stream) =>
    stream.getTracks().every((track) => track.readyState === 'ended'))));
  assert.equal((await state()).captureState, 'closed');
  assert.deepEqual((await state()).errors, []);
  await assertNoPublication();
  await phase('cancel-stops-late-capture');

  await page.evaluate(() => { window.captureTest.delayed = false; });
  if (process.env.WI004_JOIN_TEST === '1') {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      await page.locator('#start').click();
      await captureState('preview');
      await page.locator('#join').click();
      await waitState((current) => current.publisher?.connection === 'connected', 'Connected publisher', 30000);
      const connected = await state();
      assert.equal(connected.captureState, 'joined');
      assert.equal(connected.mediaMode, 'devices');
      assert.deepEqual(connected.errors, []);
      assert.equal(connected.frequency, undefined);
      const cleanup = await page.evaluate(() => window.baseline.leave());
      assert(cleanup.peers.every((value) => value === 'closed'));
      assert(cleanup.tracks.every((value) => value === 'ended'));
      await phase(attempt ? 'same-page-device-rejoin' : 'explicit-device-join', { connected, cleanup });
      await delay(1500);
    }
  }

  if (url.protocol === 'https:') {
    const mixed = new URL(url);
    mixed.searchParams.set('endpoint', 'ws://127.0.0.1:18080/webrtc');
    await page.goto(mixed.href);
    await page.locator('#start').click();
    await captureState('error');
    assert.match((await state()).currentError.message, /HTTPS requires/);
    assert.equal(await page.evaluate(() => window.captureTest.calls), 0);
    await phase('mixed-content-rejected-before-capture');
  }
  report.passed = true;
}

try {
  watchdog = setTimeout(() => rejectAbort(new Error('Device permission checks exceeded 150 seconds')), 150000);
  await Promise.race([run(), aborted]);
} catch (error) {
  report.passed = false;
  report.failure = error.stack;
  process.exitCode = 1;
} finally {
  clearTimeout(watchdog);
  for (const browser of browsers) {
    for (const context of browser.contexts()) for (const page of context.pages()) {
      try { await page.evaluate(() => window.baseline?.leave()); }
      catch (error) { report.cleanupError = String(error); report.passed = false; process.exitCode = 1; }
    }
    await browser.close();
  }
  report.ended = new Date().toISOString();
  await save();
  process.off('SIGINT', onSignal);
  process.off('SIGTERM', onSignal);
  console.log(JSON.stringify({ output, passed: report.passed }));
}
