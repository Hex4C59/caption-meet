import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import https from 'node:https';
import tls from 'node:tls';

const [manifestPath, outputDirectory] = process.argv.slice(2);
if (!manifestPath || !outputDirectory) throw new Error('Usage: node check-lan.mjs <lan.json> <new-evidence-directory>');
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
const ca = await fs.readFile(manifest.tls.ca);
const output = path.resolve(outputDirectory);
await fs.mkdir(path.dirname(output), { recursive: true });
await fs.mkdir(output);
const report = { started: new Date().toISOString(), checks: [], passed: false };
function get(requestPath, trust = ca, method = 'GET') {
  return new Promise((resolve, reject) => {
    const request = https.request({ host: manifest.listenIp, port: manifest.pagePort,
      path: requestPath, ca: trust, method, agent: false }, (response) => {
      const parts = [];
      let bytes = 0;
      response.on('data', (chunk) => {
        bytes += chunk.length;
        if (bytes > 2 * 1024 * 1024) request.destroy(new Error('Response exceeded fixture bound'));
        else parts.push(chunk);
      });
      response.on('end', () => resolve({ status: response.statusCode, headers: response.headers,
        body: Buffer.concat(parts).toString('utf8') }));
      response.on('error', reject);
    });
    request.setTimeout(5000, () => request.destroy(new Error('HTTPS request timeout')));
    request.on('error', reject);
    request.end();
  });
}
async function hostnameMustFail() {
  await new Promise((resolve, reject) => {
    const socket = tls.connect({ host: manifest.listenIp, port: manifest.pagePort,
      servername: 'not-the-fixture.invalid', ca });
    socket.setTimeout(5000, () => socket.destroy(new Error('TLS timeout')));
    socket.on('secureConnect', () => { socket.destroy(); reject(new Error('Incorrect hostname was accepted')); });
    socket.on('error', (error) => {
      socket.destroy();
      if (error.code === 'ERR_TLS_CERT_ALTNAME_INVALID') resolve();
      else reject(error);
    });
  });
}
try {
  await assert.rejects(get('/browser.html', []), (error) =>
    ['UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY', 'SELF_SIGNED_CERT_IN_CHAIN'].includes(error.code));
  report.checks.push({ name: 'untrusted-ca-rejected', passed: true });
  await hostnameMustFail();
  report.checks.push({ name: 'wrong-hostname-rejected', passed: true });
  const page = await get('/browser.html');
  assert.equal(page.status, 200);
  assert.match(page.headers['content-type'], /text\/html/);
  const scripts = [...page.body.matchAll(/(?:src|href)="(\/assets\/[^"?]+)"/g)].map((match) => match[1]);
  assert(scripts.length > 0, 'bundled browser assets must be referenced');
  for (const resource of scripts) {
    const response = await get(resource);
    assert.equal(response.status, 200, resource);
    assert(!response.body.includes('-----BEGIN PRIVATE KEY-----'));
    assert(!response.body.includes('-----BEGIN RSA PRIVATE KEY-----'));
  }
  report.checks.push({ name: 'trusted-page-and-assets', assets: scripts, passed: true });
  const forbidden = ['/tls/server.key', '/tls/ca.key', '/server.key', '/config.json', '/lan.json',
    '/@fs' + manifest.tls.key, '/@fs' + manifest.tls.ca, '/@fs/etc/passwd',
    '/%2e%2e/tls/server.key', '/browser-client.mjs', '/.git/config', '/@vite/client'];
  for (const requestPath of forbidden) {
    assert.equal((await get(requestPath)).status, 404, requestPath);
  }
  assert.equal((await get('/browser.html', ca, 'POST')).status, 405);
  report.checks.push({ name: 'private-files-and-development-routes-unavailable', paths: forbidden, passed: true });
  const config = JSON.parse(await fs.readFile(manifest.config, 'utf8'));
  assert.equal(config.websocket_server.ssl_enable, true);
  assert.equal(config.websocket_server.cert_path, manifest.tls.cert);
  assert.equal(config.websocket_server.key_path, manifest.tls.key);
  assert.equal(config.websocket_server.listen_ip, manifest.listenIp);
  assert.equal(config.candidates[0].candidate_ip, manifest.candidateIp);
  assert.equal(config.candidates[0].port, manifest.mediaPort);
  assert.equal(config.voice_agent.enable, false);
  for (const name of ['rtmp_server', 'httpflv_server', 'ws_stream_server', 'whip_server', 'pilot_center']) assert.equal(config[name].enable, false);
  for (const key of [manifest.tls.key, path.join(path.dirname(manifest.tls.ca), 'ca.key')]) {
    assert.equal((await fs.stat(key)).mode & 0o077, 0, 'private key permissions');
  }
  report.checks.push({ name: 'isolated-config-and-private-key-permissions', passed: true });
  report.passed = true;
} catch (error) {
  report.error = error.stack;
  process.exitCode = 1;
} finally {
  report.finished = new Date().toISOString();
  await fs.writeFile(path.join(output, 'result.json'), JSON.stringify(report, null, 2), { flag: 'wx' });
  console.log(JSON.stringify(report, null, 2));
}
