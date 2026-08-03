import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { isIPv4 } from 'node:net';
import { parseArgs } from 'node:util';
import { spawnSync } from 'node:child_process';
import { X509Certificate } from 'node:crypto';
import { writeBaselineConfig, portNumber } from './prepare-config.mjs';

const { values, positionals } = parseArgs({ options: {
  ip: { type: 'string' }, 'candidate-ip': { type: 'string' },
  'page-port': { type: 'string', default: '19081' },
  'signal-port': { type: 'string', default: '19080' },
  'media-port': { type: 'string', default: '19000' },
}, allowPositionals: true });
if (positionals.length !== 1 || !values.ip) throw new Error('Usage: node prepare-lan.mjs <new-run-directory> --ip <assigned-private-IPv4>');
const ip = values.ip;
const candidateIp = values['candidate-ip'] ?? ip;
function privateIPv4(value) {
  if (!isIPv4(value)) return false;
  const [a, b] = value.split('.').map(Number);
  return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}
if (!privateIPv4(ip) || !privateIPv4(candidateIp)) throw new Error('LAN fixture requires explicit RFC1918 IPv4 addresses');
if (!Object.values(os.networkInterfaces()).flat().some((entry) => entry?.address === ip && !entry.internal)) {
  throw new Error('The page/signaling listen IP must be assigned to this machine');
}
const pagePort = portNumber(values['page-port'], 'page port');
const signalPort = portNumber(values['signal-port'], 'signaling port');
const mediaPort = portNumber(values['media-port'], 'media port');
if (pagePort === signalPort) throw new Error('HTTPS and WSS need distinct TCP ports');
const run = path.resolve(positionals[0]);
await fs.mkdir(path.dirname(run), { recursive: true });
await fs.mkdir(run, { mode: 0o700 });
const tls = path.join(run, 'tls');
await fs.mkdir(tls, { mode: 0o700 });
process.umask(0o077);
const ca = path.join(tls, 'ca.crt');
const caKey = path.join(tls, 'ca.key');
const cert = path.join(tls, 'server.crt');
const key = path.join(tls, 'server.key');
function openssl(args) {
  const result = spawnSync('openssl', args, { encoding: 'utf8', timeout: 20000, maxBuffer: 1024 * 1024 });
  if (result.error || result.status !== 0) throw new Error(`openssl ${args[0]} failed: ${result.error?.message ?? result.stderr}`);
  return result.stdout.trim();
}
openssl(['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-sha256', '-days', '7',
  '-subj', '/CN=CaptionMeet WI004 Development CA', '-keyout', caKey, '-out', ca,
  '-addext', 'basicConstraints=critical,CA:TRUE,pathlen:0',
  '-addext', 'keyUsage=critical,keyCertSign,cRLSign']);
const csr = path.join(tls, 'server.csr');
openssl(['req', '-new', '-newkey', 'rsa:2048', '-nodes', '-sha256',
  '-subj', '/CN=CaptionMeet LAN Fixture', '-keyout', key, '-out', csr]);
const extensions = path.join(tls, 'server.ext');
await fs.writeFile(extensions, `basicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature,keyEncipherment\nextendedKeyUsage=serverAuth\nsubjectAltName=IP:${ip}\n`, { flag: 'wx' });
openssl(['x509', '-req', '-in', csr, '-CA', ca, '-CAkey', caKey, '-CAcreateserial',
  '-out', cert, '-days', '7', '-sha256', '-extfile', extensions]);
const verification = openssl(['verify', '-CAfile', ca, '-verify_ip', ip, cert]);
const leaf = new X509Certificate(await fs.readFile(cert));
const root = new X509Certificate(await fs.readFile(ca));
await fs.copyFile(ca, path.join(run, 'ca.crt'), fs.constants.COPYFILE_EXCL);
const config = await writeBaselineConfig(run, { listenIp: ip, candidateIp, signalPort,
  mediaPort, tlsCert: cert, tlsKey: key, quiet: true });
const endpoint = `wss://${ip}:${signalPort}/webrtc`;
const pageUrl = `https://${ip}:${pagePort}/browser.html`;
const manifest = {
  schema: 1, generated: new Date().toISOString(), run, listenIp: ip, candidateIp,
  pagePort, signalPort, mediaPort, config, pageUrl, endpoint,
  tls: { ca, cert, key, san: leaf.subjectAltName, fingerprint256: leaf.fingerprint256,
    caFingerprint256: root.fingerprint256, validTo: leaf.validTo,
    purpose: 'HTTPS fixture and native SFU WSS; separate from top-level WebRTC DTLS credentials' },
  verification, openssl: openssl(['version']),
  devices: ['alice', 'bob', 'charlie'].map((user) => {
    const url = new URL(pageUrl);
    url.search = new URLSearchParams({ endpoint, media: 'devices', room: 'wi004-lan', user });
    return { user, url: url.href };
  }),
};
await fs.writeFile(path.join(run, 'lan.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ manifest: path.join(run, 'lan.json'), pageUrl, endpoint,
  publicCA: path.join(run, 'ca.crt'), caFingerprint256: root.fingerprint256 }, null, 2));
