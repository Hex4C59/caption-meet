import fs from 'node:fs/promises';
import path from 'node:path';
import https from 'node:https';
import { X509Certificate } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const fixtureRoot = import.meta.dirname;
const repo = path.resolve(fixtureRoot, '../..');
if (process.argv.length !== 3) throw new Error('Usage: node serve-lan.mjs <lan.json>');
const manifest = JSON.parse(await fs.readFile(path.resolve(process.argv[2]), 'utf8'));
if (manifest.schema !== 1 || new URL(manifest.pageUrl).hostname !== manifest.listenIp) throw new Error('Invalid LAN manifest');
const cert = await fs.readFile(manifest.tls.cert);
const key = await fs.readFile(manifest.tls.key);
if (!new X509Certificate(cert).checkIP(manifest.listenIp)) throw new Error('TLS certificate does not cover the listen address');
const upstream = path.resolve(process.env.WI002_CLIENT ?? path.join(repo, 'build/wi002-browser/upstream'));
const { build } = await import(pathToFileURL(path.join(upstream, 'node_modules/vite/dist/node/index.js')));
const bundles = await build({
  configFile: false, root: fixtureRoot, logLevel: 'warn',
  cacheDir: path.join(manifest.run, 'vite-cache'),
  resolve: { alias: { 'upstream-client': path.join(upstream, 'src') } },
  build: { write: false, sourcemap: false, minify: false,
    rollupOptions: { input: path.join(fixtureRoot, 'browser.html') } },
});
// Only build outputs enter the response map. Requests never become filesystem paths.
const assets = new Map();
for (const bundle of Array.isArray(bundles) ? bundles : [bundles]) {
  for (const asset of bundle.output) {
    const bytes = Buffer.from(asset.type === 'chunk' ? asset.code : asset.source);
    const type = asset.fileName.endsWith('.html') ? 'text/html; charset=utf-8'
      : asset.fileName.endsWith('.js') ? 'text/javascript; charset=utf-8'
      : asset.fileName.endsWith('.css') ? 'text/css; charset=utf-8' : 'application/octet-stream';
    assets.set('/' + asset.fileName, { bytes, type });
  }
}
if (!assets.has('/browser.html')) throw new Error('Fixture HTML was not produced');
const server = https.createServer({ cert, key, minVersion: 'TLSv1.2' }, (request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'no-referrer');
  response.setHeader('Permissions-Policy', 'camera=(self), microphone=(self)');
  if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return; }
  let pathname;
  try { pathname = new URL(request.url, manifest.pageUrl).pathname; }
  catch { response.writeHead(400); response.end(); return; }
  const asset = assets.get(pathname === '/' ? '/browser.html' : pathname);
  if (!asset) { response.writeHead(404); response.end(); return; }
  response.writeHead(200, { 'Content-Type': asset.type, 'Content-Length': asset.bytes.length });
  response.end(request.method === 'HEAD' ? undefined : asset.bytes);
});
server.headersTimeout = 10000;
server.requestTimeout = 10000;
await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(manifest.pagePort, manifest.listenIp, resolve);
});
console.log(JSON.stringify({ pageUrl: manifest.pageUrl, endpoint: manifest.endpoint,
  assets: [...assets.keys()], tlsFingerprint: manifest.tls.fingerprint256 }));
let closing = false;
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => {
  if (closing) return;
  closing = true;
  server.close();
  server.closeAllConnections();
});
