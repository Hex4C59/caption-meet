import { constants } from 'node:fs';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { X509Certificate } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function inside(parent, child) {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith(`..${path.sep}`)
    && relative !== '..' && !path.isAbsolute(relative));
}

async function exists(target) {
  try { await fs.lstat(target); return true; }
  catch (error) { if (error.code === 'ENOENT') return false; throw error; }
}

async function resolveCertutil() {
  const candidates = process.env.WI004_CERTUTIL
    ? [path.resolve(process.env.WI004_CERTUTIL)]
    : ['/usr/bin/certutil', path.join(repo, 'build/wi004/tools/usr/bin/certutil')];
  for (const candidate of candidates) {
    try { await fs.access(candidate, constants.X_OK); return candidate; }
    catch (error) { if (!['ENOENT', 'EACCES'].includes(error.code)) throw error; }
  }
  throw new Error('certutil is unavailable; set WI004_CERTUTIL to its executable path.');
}

function run(certutil, args) {
  const result = spawnSync(certutil, args, {
    encoding: 'utf8', timeout: 15000, maxBuffer: 512 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`certutil failed (${result.status}): ${result.stderr.trim()}`);
  }
  return result.stdout;
}

async function main() {
  const [certificateArgument, directoryArgument, extra] = process.argv.slice(2);
  if (!certificateArgument || !directoryArgument || extra) {
    throw new Error('Usage: node scripts/baseline/prepare-browser-trust.mjs <public-ca.crt> <new-build-trust-directory>');
  }
  // Chromium checks this legacy database before XDG_DATA_HOME, even with a new profile.
  if (await exists(path.join(os.homedir(), '.pki/nssdb'))) {
    throw new Error('Legacy ~/.pki/nssdb exists and overrides XDG_DATA_HOME; refusing to alter or use it.');
  }
  const certificatePath = await fs.realpath(path.resolve(certificateArgument));
  const pem = await fs.readFile(certificatePath, 'utf8');
  if (/-----BEGIN [^-]*PRIVATE KEY-----/.test(pem)) {
    throw new Error('Expected a public CA certificate without private key material.');
  }
  const certificate = new X509Certificate(pem);
  if (!certificate.ca) throw new Error('The supplied certificate is not a CA.');

  const requested = path.resolve(directoryArgument);
  const parent = await fs.realpath(path.dirname(requested));
  const buildRoot = await fs.realpath(path.join(repo, 'build'));
  if (!inside(buildRoot, parent)) {
    throw new Error('Trust directory must be a new directory under this repository\'s build directory.');
  }
  const trustDataDirectory = path.join(parent, path.basename(requested));
  if (await exists(trustDataDirectory)) throw new Error('Trust directory already exists; refusing to overwrite it.');
  const certutil = await resolveCertutil();
  await fs.mkdir(trustDataDirectory, { mode: 0o700 });
  const databaseDirectory = path.join(trustDataDirectory, 'pki/nssdb');
  await fs.mkdir(databaseDirectory, { recursive: true, mode: 0o700 });
  run(certutil, ['-N', '-d', `sql:${databaseDirectory}`, '--empty-password']);
  run(certutil, ['-A', '-d', `sql:${databaseDirectory}`, '-n', 'WI004-Test-CA',
    '-t', 'C,,', '-i', certificatePath]);
  const imported = new X509Certificate(run(certutil,
    ['-L', '-d', `sql:${databaseDirectory}`, '-n', 'WI004-Test-CA', '-a']));
  if (imported.fingerprint256 !== certificate.fingerprint256) {
    throw new Error('Imported CA fingerprint does not match the supplied certificate.');
  }
  const manifest = {
    trustDataDirectory, databaseDirectory, certutil,
    caFingerprintSha256: certificate.fingerprint256,
    browserEnvironment: { XDG_DATA_HOME: trustDataDirectory },
    instructions: 'Pass browserEnvironment only to the test browser child and use a separate userDataDir. Keep HOME unchanged. Recheck that ~/.pki/nssdb is absent before launch. Do not disable TLS validation.',
  };
  await fs.writeFile(path.join(trustDataDirectory, 'trust-manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((error) => {
  console.error(`prepare-browser-trust: ${error.message}`);
  process.exitCode = 1;
});
