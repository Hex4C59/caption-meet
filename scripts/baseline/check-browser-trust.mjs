import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
let activeContext;
let launching;
let interrupted;
const signalHandlers = new Map();
for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  const handler = () => {
    interrupted = signal;
    Promise.resolve(launching).then(() => activeContext?.close()).catch(() => {});
  };
  signalHandlers.set(signal, handler);
  process.once(signal, handler);
}

async function metadata(target) {
  try {
    const stat = await fs.lstat(target);
    return { size: stat.size, mtimeMs: stat.mtimeMs, ctimeMs: stat.ctimeMs, ino: stat.ino };
  } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

async function existingTrustMetadata() {
  const result = {};
  for (const relative of ['.pki/nssdb', '.local/share/pki/nssdb']) {
    result[relative] = await metadata(path.join(os.homedir(), relative));
    for (const name of ['cert9.db', 'key4.db', 'pkcs11.txt']) {
      result[`${relative}/${name}`] = await metadata(path.join(os.homedir(), relative, name));
    }
  }
  return result;
}

async function buildPath(argument, mustExist) {
  const requested = path.resolve(argument);
  const target = mustExist ? await fs.realpath(requested)
    : path.join(await fs.realpath(path.dirname(requested)), path.basename(requested));
  const build = await fs.realpath(path.join(repo, 'build'));
  const relative = path.relative(build, target);
  assert(relative && relative !== '..' && !relative.startsWith(`..${path.sep}`)
    && !path.isAbsolute(relative), 'Trust and evidence directories must be under repository build/');
  return target;
}

async function main() {
  const [manifestArgument, trustArgument, outputArgument, extra] = process.argv.slice(2);
  assert(manifestArgument && trustArgument && outputArgument && !extra,
    'Usage: node scripts/baseline/check-browser-trust.mjs <lan.json> <trust-data> <new-evidence-directory>');
  const manifest = JSON.parse(await fs.readFile(path.resolve(manifestArgument), 'utf8'));
  assert.equal(new URL(manifest.pageUrl).protocol, 'https:');
  assert.equal(new URL(manifest.endpoint).protocol, 'wss:');
  const trust = await buildPath(trustArgument, true);
  const trustManifest = JSON.parse(await fs.readFile(path.join(trust, 'trust-manifest.json'), 'utf8'));
  assert.equal(trustManifest.trustDataDirectory, trust);
  assert.equal(trustManifest.caFingerprintSha256, manifest.tls.caFingerprint256);
  const output = await buildPath(outputArgument, false);
  const before = await existingTrustMetadata();
  assert.equal(before['.pki/nssdb'], null, 'Legacy NSS database overrides XDG_DATA_HOME; aborting');
  await fs.mkdir(output, { mode: 0o700 });
  const untrusted = path.join(output, 'untrusted-data');
  await fs.mkdir(untrusted, { mode: 0o700 });
  const driver = path.resolve(process.env.WI002_DRIVER ?? path.join(repo, 'build/wi002-browser/driver'));
  const { chromium } = await import(pathToFileURL(path.join(driver, 'node_modules/playwright-core/index.mjs')));
  const executablePath = process.env.WI002_CHROME ?? chromium.executablePath();
  const result = { started: new Date().toISOString(), pageUrl: manifest.pageUrl,
    endpoint: manifest.endpoint, executablePath, tlsValidationBypass: false,
    caFingerprintSha256: trustManifest.caFingerprintSha256, before, phases: [], cleanupErrors: [] };
  try {
    for (const trusted of [false, true]) {
      assert(!interrupted, `Interrupted by ${interrupted}`);
      const phase = { trusted, xdgDataHome: trusted ? trust : untrusted };
      result.phases.push(phase);
      launching = chromium.launchPersistentContext(path.join(output, trusted ? 'trusted-profile' : 'untrusted-profile'), {
        executablePath, headless: true, chromiumSandbox: true,
        handleSIGINT: false, handleSIGTERM: false, handleSIGHUP: false,
        env: { ...process.env, XDG_DATA_HOME: phase.xdgDataHome },
      });
      activeContext = await launching;
      assert(!interrupted, `Interrupted by ${interrupted}`);
      phase.browserVersion = activeContext.browser().version();
      const page = await activeContext.newPage();
      if (!trusted) {
        try { await page.goto(manifest.pageUrl, { waitUntil: 'load', timeout: 15000 }); }
        catch (error) { phase.navigationError = error.message; }
        assert.match(phase.navigationError ?? '', /net::ERR_CERT_AUTHORITY_INVALID/,
          'Untrusted CA must fail normal browser certificate validation');
        phase.passed = true;
      } else {
        const response = await page.goto(manifest.pageUrl, { waitUntil: 'load', timeout: 15000 });
        phase.status = response.status();
        phase.securityDetails = await response.securityDetails();
        assert.equal(phase.status, 200);
        phase.context = await page.evaluate(() => ({ secure: isSecureContext, protocol: location.protocol }));
        assert.equal(phase.context.secure, true);
        assert.equal(phase.context.protocol, 'https:');
        phase.websocket = await page.evaluate((endpoint) => new Promise((resolve) => {
          const socket = new WebSocket(endpoint, 'protoo');
          let opened = false;
          const timeout = setTimeout(() => {
            socket.close();
            resolve({ opened, error: 'WebSocket timeout' });
          }, 10000);
          socket.onopen = () => { opened = true; socket.close(1000, 'trust probe complete'); };
          socket.onerror = () => { clearTimeout(timeout); resolve({ opened, error: 'WebSocket error' }); };
          socket.onclose = (event) => { clearTimeout(timeout); resolve({ opened, code: event.code }); };
        }), manifest.endpoint);
        assert.equal(phase.websocket.error, undefined);
        assert.equal(phase.websocket.opened, true);
        phase.passed = true;
      }
      await activeContext.close();
      activeContext = undefined;
    }
  } catch (error) {
    result.error = error.message;
    process.exitCode = 1;
  } finally {
    try { await activeContext?.close(); }
    catch (error) { result.cleanupErrors.push(error.message); process.exitCode = 1; }
    activeContext = undefined;
    result.after = await existingTrustMetadata();
    result.existingTrustUnchanged = JSON.stringify(before) === JSON.stringify(result.after);
    if (!result.existingTrustUnchanged) {
      result.error ??= 'Existing trust database metadata changed; isolation needs review.';
      process.exitCode = 1;
    }
    if (interrupted) { result.interrupted = interrupted; process.exitCode = 1; }
    result.passed = !result.error && !interrupted && result.cleanupErrors.length === 0
      && result.phases.length === 2 && result.phases.every((phase) => phase.passed);
    result.finished = new Date().toISOString();
    await fs.writeFile(path.join(output, 'result.json'), `${JSON.stringify(result, null, 2)}\n`, { flag: 'wx' });
    console.log(JSON.stringify({ passed: result.passed, output, error: result.error }, null, 2));
  }
}

main().catch((error) => {
  console.error(`check-browser-trust: ${error.message}`);
  process.exitCode = 1;
}).finally(() => {
  for (const [signal, handler] of signalHandlers) process.removeListener(signal, handler);
});
