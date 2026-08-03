import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '../..');
const output = path.resolve(process.env.WI003_OUTPUT ?? `build/wi003/evidence/pre-stun-${Date.now()}`);
const binary = path.resolve(process.env.WI003_BINARY ?? 'build/wi003-debug/RTCPilot');
const config = path.resolve(process.env.WI003_CONFIG ?? 'build/wi003/run/config.json');
const full = process.env.WI003_FULL === '1';
const { chromium } = await import(pathToFileURL(path.join(root, 'build/wi002-browser/driver/node_modules/playwright-core/index.mjs')));
const executablePath = process.env.WI002_CHROME ?? chromium.executablePath();
await fs.mkdir(path.dirname(output), { recursive: true });
await fs.mkdir(output);
const report = { started: new Date().toISOString(), binary, config, full, phases: [], samples: [], pageErrors: [] };
const log = await fs.open(path.join(output, 'observer.log'), 'wx');
const server = spawn('gdb', ['-q', '-nx', '--batch', '-x', path.join(root, 'scripts/baseline/pre-stun-observe.gdb'), '--args', binary, config], { cwd: root, detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
let pending = '';
let browser;
let page;
let baseline;
let stopped = false;
let serverClosed = false;
let closing = false;
let browserPid;
let launchPromise;
let logWrites = Promise.resolve();
const cancellation = new AbortController();
let cancel;
const cancelled = new Promise((_, reject) => {
  cancel = (error) => {
    if (cancellation.signal.aborted) return;
    report.cancellation = error.message;
    cancellation.abort(error);
    reject(error);
  };
});
cancelled.catch(() => {});
const signals = new Map(['SIGINT', 'SIGTERM'].map((signal) => [signal, () => cancel(new Error(`Interrupted by ${signal}`))]));
for (const [signal, handler] of signals) process.once(signal, handler);
const watchdog = setTimeout(() => cancel(new Error('Pre-STUN run exceeded its internal deadline')), full ? 240000 : 75000);
const pause = (ms) => delay(ms, undefined, { signal: cancellation.signal });
async function bounded(operation, timeout, label) {
  let timer;
  try {
    return await Promise.race([operation, new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${label} timed out`)), timeout);
    })]);
  } finally { clearTimeout(timer); }
}
function signalOwned(pid, signal) {
  if (!Number.isInteger(pid) || pid === 0) return;
  try { process.kill(pid, signal); } catch (error) { if (error.code !== 'ESRCH') throw error; }
}
function appendLog(data) {
  logWrites = logWrites.then(() => log.write(data));
  logWrites.catch(cancel);
}
server.on('error', cancel);
server.on('close', () => { serverClosed = true; });
server.on('exit', (code, signal) => {
  stopped = true;
  report.serverExit = { code, signal };
  if (!closing) cancel(new Error('Observed SFU stopped unexpectedly'));
});
server.stdout.on('data', (data) => {
  appendLog(data);
  pending += data;
  const lines = pending.split('\n');
  pending = lines.pop();
  for (const line of lines) {
    const start = line.indexOf('WI003_METRICS ');
    if (start < 0) continue;
    try { report.samples.push(JSON.parse(line.slice(start + 14))); }
    catch (error) { cancel(new Error(`Invalid observer metric: ${error.message}`)); }
  }
});
server.stderr.on('data', appendLog);
const latest = () => report.samples.at(-1);
async function waitFor(predicate, timeout = 10000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (stopped) throw new Error('Observed SFU stopped unexpectedly');
    if (predicate()) return latest();
    await pause(100);
  }
  throw new Error(`Condition timed out after ${timeout} ms`);
}
async function fresh() {
  const sequence = latest()?.sample ?? 0;
  return waitFor(() => latest()?.sample > sequence);
}
function atBaseline(sample) {
  assert.deepEqual(sample.probeErrors, [], 'observer reads must succeed');
  for (const key of ['usernameSessions', 'addressSessions', 'liveSessions', 'registeredTimers']) {
    assert.equal(sample[key], baseline[key], `${key} must return to the joined-room baseline`);
  }
  assert.deepEqual(sample.liveObjects, baseline.liveObjects, 'all tracked media objects must return to baseline');
}
async function record(name, operation) {
  const phase = { name, started: new Date().toISOString(), passed: false };
  report.phases.push(phase);
  await operation(phase);
  phase.passed = true;
  console.log(JSON.stringify({ phase: name, passed: true }));
}
async function run() {
  await waitFor(() => latest(), 20000);
  // This driver owns signal cleanup; Playwright must not close the page first.
  launchPromise = chromium.launch({ executablePath, headless: true, chromiumSandbox: true,
    timeout: 15000, handleSIGINT: false, handleSIGTERM: false });
  browser = await launchPromise;
  const cdp = await browser.newBrowserCDPSession();
  const { processInfo } = await cdp.send('SystemInfo.getProcessInfo');
  browserPid = processInfo.find((entry) => entry.type === 'browser')?.id;
  await cdp.detach();
  page = await browser.newPage();
  page.on('pageerror', (error) => report.pageErrors.push(error.message));
  await page.goto(`http://127.0.0.1:18081/pre-stun.html?room=wi003-${Date.now()}`);
  await page.locator('#start').click();
  await page.waitForFunction(() => window.preStun?.ready, null, { timeout: 10000 });
  await page.evaluate(() => window.preStun.join());
  baseline = report.baseline = await fresh();
  assert.equal(baseline.usernameSessions, 0);
  assert.deepEqual(baseline.probeErrors, []);
  let expired;
  await record('no-first-stun-expiry', async (phase) => {
    const before = latest().stunCalls;
    expired = await page.evaluate(() => window.preStun.publish());
    phase.registered = await waitFor(() => latest().usernameSessions === 1);
    assert.equal(phase.registered.addressSessions, 0);
    assert.equal(phase.registered.liveSessions, 1);
    assert(phase.registered.registeredTimers > baseline.registeredTimers);
    phase.browser = await page.evaluate((index) => window.preStun.snapshot(index), expired);
    assert.equal(phase.browser.packetsSent, 0);
    assert.equal(phase.registered.stunCalls, before);
    await pause(39000);
    phase.expired = await fresh();
    assert.equal(phase.expired.stunCalls, before);
    atBaseline(phase.expired);
  });
  if (full) {
    await record('late-stun-cannot-resurrect', async (phase) => {
      const calls = latest().stunCalls;
      await page.evaluate((index) => window.preStun.connect(index), expired);
      phase.after = await waitFor(() => latest().stunCalls > calls);
      atBaseline(phase.after);
      phase.browser = await page.evaluate((index) => window.preStun.snapshot(index), expired);
      assert.notEqual(phase.browser.connection, 'connected');
      await page.evaluate((index) => window.preStun.closeMedia(index), expired);
    });
    await record('repeat-no-stun-expiry', async (phase) => {
      phase.indices = await page.evaluate(async () => [await window.preStun.publish(), await window.preStun.publish()]);
      phase.registered = await waitFor(() => latest().usernameSessions === 2);
      await pause(39000);
      phase.after = await fresh();
      atBaseline(phase.after);
    });
    await record('first-stun-before-expiry-and-active-renewal', async (phase) => {
      const index = await page.evaluate(() => window.preStun.publish());
      phase.registered = await waitFor(() => latest().usernameSessions === 1);
      await pause(27000);
      await page.evaluate((i) => window.preStun.connect(i), index);
      await page.waitForFunction((i) => window.preStun.snapshot(i).then((state) => state.connection === 'connected'), index, { timeout: 10000 });
      phase.connected = await fresh();
      assert.equal(phase.connected.addressSessions, 1);
      const first = await page.evaluate((i) => window.preStun.snapshot(i), index);
      await pause(39000);
      phase.renewed = await fresh();
      phase.browser = await page.evaluate((i) => window.preStun.snapshot(i), index);
      assert.equal(phase.renewed.usernameSessions, 1);
      assert.equal(phase.renewed.liveSessions, 1);
      assert.equal(phase.browser.connection, 'connected');
      assert(phase.browser.packetsSent > first.packetsSent);
      await page.evaluate((i) => window.preStun.closeMedia(i), index);
      await pause(39000);
      phase.afterClose = await fresh();
      atBaseline(phase.afterClose);
    });
  }
  assert.deepEqual(report.pageErrors, []);
  assert.deepEqual(await page.evaluate(() => window.preStun.errors), []);
}
try {
  await Promise.race([run(), cancelled]);
  report.passed = true;
} catch (error) {
  report.passed = false;
  report.error = error.stack;
  console.error(error.message);
  process.exitCode = 1;
} finally {
  closing = true;
  clearTimeout(watchdog);
  cancellation.abort();
  report.cleanup = { errors: [], forcedServerKill: false };
  const cleanupError = (error) => {
    report.cleanup.errors.push(String(error));
    report.passed = false;
    process.exitCode = 1;
  };
  try {
    if (!browser && launchPromise) browser = await bounded(launchPromise, 17000, 'Browser startup cleanup');
    if (page) {
      report.cleanup.page = await bounded(page.evaluate(() => window.preStun?.cleanup()), 3000, 'Page cleanup');
      assert(report.cleanup.page, 'page cleanup must return evidence');
      assert(report.cleanup.page.peers.every((state) => state === 'closed'));
      assert(report.cleanup.page.tracks.every((state) => state === 'ended'));
      assert.equal(report.cleanup.page.signaling, 'new');
      assert(['closed', 'not-created'].includes(report.cleanup.page.audioContext));
    }
  } catch (error) { cleanupError(error); }
  try {
    if (browser) await bounded(browser.close(), 5000, 'Browser close');
  } catch (error) {
    cleanupError(error);
    try { signalOwned(browserPid, 'SIGKILL'); } catch (killError) { cleanupError(killError); }
  }
  try {
    signalOwned(server.pid && -server.pid, 'SIGTERM');
    signalOwned(latest()?.pid, 'SIGTERM');
    for (let i = 0; (!stopped || !serverClosed) && i < 50; i++) await delay(100);
    if (!stopped || !serverClosed) {
      report.cleanup.forcedServerKill = true;
      signalOwned(server.pid && -server.pid, 'SIGKILL');
      signalOwned(latest()?.pid, 'SIGKILL');
      for (let i = 0; (!stopped || !serverClosed) && i < 20; i++) await delay(100);
    }
    assert((stopped && serverClosed) || !server.pid, 'owned GDB process and its output streams must close');
  } catch (error) { cleanupError(error); }
  try {
    await bounded(logWrites, 3000, 'Observer log flush');
    await log.close();
  } catch (error) { cleanupError(error); }
  for (const [signal, handler] of signals) process.removeListener(signal, handler);
  report.finished = new Date().toISOString();
  await fs.writeFile(path.join(output, 'result.json'), JSON.stringify(report, null, 2), { flag: 'wx' });
  console.log(JSON.stringify({ output, passed: report.passed }));
}
