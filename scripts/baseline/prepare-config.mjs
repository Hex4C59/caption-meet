import fs from 'node:fs/promises';
import path from 'node:path';
import { isIPv4 } from 'node:net';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export function portNumber(value, name) {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error(name + ' must be an unprivileged TCP/UDP port');
  return port;
}

export async function writeBaselineConfig(runDirectory, options = {}) {
  const run = path.resolve(runDirectory);
  const listenIp = options.listenIp ?? '127.0.0.1';
  const candidateIp = options.candidateIp ?? listenIp;
  if (!isIPv4(listenIp) || !isIPv4(candidateIp) || candidateIp === '0.0.0.0') throw new Error('Explicit IPv4 listen and candidate addresses required');
  const tls = Boolean(options.tlsCert || options.tlsKey);
  if (tls && !(options.tlsCert && options.tlsKey)) throw new Error('WSS requires both certificate and private key paths');
  if (tls) {
    await fs.access(options.tlsCert);
    await fs.access(options.tlsKey);
  }
  const config = {
    log: { log_level: options.quiet ? 'warn' : 'info', log_path: path.join(run, 'server.log') },
    event_log: {
      rtc_log_path: options.quiet ? '/dev/null' : path.join(run, 'rtc-event.log'),
      rtc_stream_log_path: options.quiet ? '/dev/null' : path.join(run, 'rtc-stream.log'),
    },
    websocket_server: {
      ssl_enable: tls, listen_ip: listenIp, port: portNumber(options.signalPort ?? 18080, 'signaling port'),
      ...(tls ? { cert_path: path.resolve(options.tlsCert), key_path: path.resolve(options.tlsKey) } : {}),
    },
    candidates: [{ nettype: 'udp', candidate_ip: candidateIp, listen_ip: listenIp, port: portNumber(options.mediaPort ?? 18000, 'media port') }],
    // These upstream test credentials are for WebRTC DTLS, not HTTPS/WSS trust.
    cert_path: path.join(repo, 'third_party/RTCPilot/RTCPilot/certificate.crt'),
    key_path: path.join(repo, 'third_party/RTCPilot/RTCPilot/private.key'),
    downlink_discard_percent: 0,
    uplink_discard_percent: 0,
    rtmp_server: { enable: false },
    httpflv_server: { enable: false },
    ws_stream_server: { enable: false },
    whip_server: { enable: false },
    pilot_center: { enable: false },
    voice_agent: { enable: false, tts_config: { tts_enable: false } },
  };
  await fs.mkdir(run, { recursive: true });
  const target = path.join(run, 'config.json');
  await fs.writeFile(target, JSON.stringify(config, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  return target;
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  console.log(await writeBaselineConfig(process.argv[2] ?? path.join(repo, 'build/rtcpilot-meeting-baseline/run')));
}
