import PCWrap from 'upstream-client/peerConnectionWrap/PCWrap.ts';
import ProtooClientWrap from 'upstream-client/peerConnectionWrap/ProtooClientWrap.ts';

// Test fixture only. The imported MIT upstream files remain unchanged.
const settings = Object.fromEntries(new URLSearchParams(location.search));
const mediaMode = settings.media ?? 'synthetic';
const userId = settings.user ?? (mediaMode === 'devices' ? 'guest-' + crypto.randomUUID().slice(0, 8) : 'alice');
const roomId = settings.room ?? 'wi002';
const frequency = Number(settings.frequency ?? 440);
const endpoint = settings.endpoint ?? new URL('/webrtc', location.protocol.replace('http', 'ws') + '//' + location.hostname + ':18080').href;
const remotes = new Map();
const events = [];
const errors = [];
const pending = new Set();
let signalState = 'idle';
let captureState = 'idle';
let currentError = null;
let audioContext;
let oscillator;
let drawingTimer;
let heartbeatTimer;
let localStream;
let localFigure;
let publisher;
let signaling;
let generation = 0;
let closed = true;
let collectionTimer;
let collection = { intervalMs: 10000, durationMs: 600000, samples: [] };

function record(method, data = {}) {
  events.push({ at: Date.now(), method, ...data });
  if (events.length > 128) events.shift();
}

function controls(message) {
  if (message) document.querySelector('#status').textContent = message;
  document.querySelector('#start').disabled = ['opening', 'preview', 'joining', 'joined'].includes(captureState);
  document.querySelector('#join').disabled = captureState !== 'preview';
  document.querySelector('#leave').disabled = closed;
  document.querySelector('#collect').disabled = captureState !== 'joined' || Boolean(collectionTimer);
}

function fail(error) {
  currentError = { code: error?.name ?? 'Error', message: String(error?.message ?? error) };
  errors.push(currentError.message);
  if (errors.length > 32) errors.shift();
  controls(currentError.message);
}

function checkCurrent(token) {
  if (closed || token !== generation) throw new DOMException('Operation cancelled', 'AbortError');
}

async function bounded(promise, label, timeout = 15000) {
  let timer;
  let cancel;
  const guard = new Promise((_, reject) => {
    cancel = () => reject(new DOMException(label + ' cancelled', 'AbortError'));
    timer = setTimeout(() => reject(new Error(label + ' timed out; leave and retry')), timeout);
    pending.add(cancel);
  });
  try { return await Promise.race([promise, guard]); }
  finally { clearTimeout(timer); pending.delete(cancel); }
}

function validateSettings() {
  if (!['synthetic', 'devices'].includes(mediaMode)) throw new Error('Unknown media mode');
  const url = new URL(endpoint);
  if (!['ws:', 'wss:'].includes(url.protocol) || url.username || url.password || url.hash || url.search) {
    throw new Error('Signaling must be a ws/wss URL without credentials, query or fragment');
  }
  if (location.protocol === 'https:' && url.protocol !== 'wss:') throw new Error('HTTPS requires a secure WSS signaling URL');
  if (mediaMode === 'devices' && (!isSecureContext || !navigator.mediaDevices?.getUserMedia)) {
    throw new Error('Camera and microphone need trusted HTTPS or localhost');
  }
}

function makeSignaling(token) {
  return new ProtooClientWrap({
    onClose: () => { if (token === generation) { signalState = 'closed'; record('signal-close'); } },
    onDisconnected: () => { if (token === generation) { signalState = 'disconnected'; record('signal-disconnected'); } },
    onNotification: ({ method, data }) => {
      if (closed || token !== generation) return;
      record(method, { userId: data?.userId,
        pushers: data?.pushers?.map(({ pusherId, rtpParam }) => ({ id: pusherId, kind: rtpParam.av_type, ssrc: rtpParam.ssrc })) });
      const onFailure = (error) => { if (!closed && token === generation) fail(error); };
      if (method === 'newPusher') subscribe(data).catch(onFailure);
      if (method === 'newUser') {
        for (const user of Array.isArray(data) ? data : [data]) subscribe(user).catch(onFailure);
      }
      if (method === 'userLeave') removeRemote(data.userId);
    },
  });
}

function frame(label, element) {
  const figure = document.createElement('figure');
  const caption = document.createElement('figcaption');
  caption.textContent = label;
  figure.append(element, caption);
  document.querySelector('#media').append(figure);
  return figure;
}

function createSyntheticMedia() {
  oscillator = audioContext.createOscillator();
  oscillator.frequency.value = frequency;
  const gain = audioContext.createGain();
  gain.gain.value = 0.12;
  const destination = audioContext.createMediaStreamDestination();
  oscillator.connect(gain).connect(destination);
  oscillator.start();
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  let count = 0;
  const draw = () => {
    count += 1;
    ctx.fillStyle = 'hsl(' + ((count * 7 + frequency) % 360) + ', 70%, 45%)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect((count * 17) % 550, 110, 90, 90);
    ctx.font = '36px sans-serif';
    ctx.fillText(userId + ': ' + count, 24, 60);
    ctx.fillText(frequency + ' Hz', 24, 300);
  };
  draw();
  drawingTimer = setInterval(draw, 100);
  localFigure = frame('Local ' + userId, canvas);
  const videoStream = canvas.captureStream(10);
  localStream = new MediaStream([...destination.stream.getAudioTracks(), ...videoStream.getVideoTracks()]);
}

function captureError(error) {
  const messages = {
    NotAllowedError: 'Camera or microphone permission denied. Allow both for this site, then retry preview.',
    NotFoundError: 'Camera or microphone unavailable. Connect both devices, then retry preview.',
    NotReadableError: 'Camera or microphone could not start. Close other capture apps, then retry preview.',
    OverconstrainedError: 'Camera or microphone settings are unavailable. Check the devices, then retry preview.',
  };
  if (messages[error?.name]) return new DOMException(messages[error.name], error.name);
  return error;
}

async function preview() {
  if (!closed) return;
  const token = ++generation;
  closed = false;
  errors.length = 0;
  currentError = null;
  captureState = 'opening';
  controls(mediaMode === 'devices' ? 'Opening camera and microphone' : 'Starting synthetic media');
  try {
    validateSettings();
    audioContext = new AudioContext({ sampleRate: 48000 });
    await bounded(audioContext.resume(), 'Audio playback');
    checkCurrent(token);
    if (mediaMode === 'synthetic') {
      createSyntheticMedia();
    } else {
      const capture = navigator.mediaDevices.getUserMedia({ audio: true, video: { width: { ideal: 640 }, height: { ideal: 360 } } });
      // A browser permission prompt may resolve after cancellation or our timeout.
      capture.then((stream) => {
        if (token !== generation || closed) for (const track of stream.getTracks()) track.stop();
      }, () => {});
      localStream = await bounded(capture, 'Camera and microphone permission', 30000);
      checkCurrent(token);
      if (localStream.getAudioTracks().length !== 1 || localStream.getVideoTracks().length !== 1) {
        throw new Error('Preview requires one camera and one microphone');
      }
      const video = document.createElement('video');
      video.muted = true;
      video.autoplay = true;
      video.playsInline = true;
      video.srcObject = localStream;
      localFigure = frame('Local ' + userId, video);
      await bounded(video.play(), 'Local preview');
      checkCurrent(token);
      for (const track of localStream.getTracks()) track.addEventListener('ended', () => {
        if (token !== generation || closed) return;
        leave().then(() => {
          captureState = 'error';
          fail(new Error('Camera or microphone stopped. Check permissions and devices, then retry preview.'));
        }).catch(fail);
      }, { once: true });
    }
    captureState = 'preview';
    controls('Preview ready: ' + userId + ' / ' + roomId);
    record('preview-ready', { mediaMode });
  } catch (error) {
    if (token !== generation) return;
    await leave();
    captureState = 'error';
    fail(captureError(error));
  }
}

async function request(method, data) {
  const response = await bounded(signaling.sendRequest(method, { roomId, userId, ...data }), method);
  if (response?.code !== 0) throw new Error(method + ' failed: ' + response?.code);
  return response;
}

async function subscribe(user) {
  const token = generation;
  if (closed || !user || user.userId === userId || !user.pushers?.length) return;
  const signature = user.pushers.map((pusher) => pusher.pusherId).sort().join(',');
  if (remotes.get(user.userId)?.signature === signature) return;
  const kinds = user.pushers.map((pusher) => pusher.rtpParam.av_type).sort();
  if (JSON.stringify(kinds) !== JSON.stringify(['audio', 'video'])) {
    throw new Error(user.userId + ' advertised ' + kinds.join(',') + '; expected one audio and one video publication');
  }
  removeRemote(user.userId);
  const wrapper = new PCWrap({ direction: 'recvonly', iceServers: [] });
  const stream = new MediaStream();
  const video = document.createElement('video');
  video.autoplay = true;
  video.playsInline = true;
  video.srcObject = stream;
  const remote = { wrapper, stream, video, signature, figure: frame('Remote ' + user.userId, video) };
  remotes.set(user.userId, remote);
  wrapper.on('track', ({ track }) => {
    if (closed || token !== generation || remotes.get(user.userId) !== remote) { track.stop(); return; }
    stream.addTrack(track);
    if (track.kind === 'audio') {
      remote.audioSource = audioContext.createMediaStreamSource(new MediaStream([track]));
      remote.analyser = audioContext.createAnalyser();
      remote.analyser.fftSize = 8192;
      remote.silentGain = audioContext.createGain();
      remote.silentGain.gain.value = 0;
      remote.audioSource.connect(remote.analyser).connect(remote.silentGain).connect(audioContext.destination);
    }
    video.play().catch((error) => { if (!closed && token === generation) fail(error); });
  });
  const specs = user.pushers.map(({ pusherId, rtpParam }) => ({ type: rtpParam.av_type, pusher_id: pusherId }));
  wrapper.addTransceivers(specs);
  const offer = await bounded(wrapper.createOfferAndEmit(), 'Receive offer');
  checkCurrent(token);
  const response = await request('pull', { sdp: offer, targetUserId: user.userId, specs });
  if (closed || token !== generation || remotes.get(user.userId) !== remote) return;
  // Upstream PCWrap drops this Promise. Await the native API.
  await bounded(wrapper.getPeerConnection().setRemoteDescription({ type: 'answer', sdp: response.sdp }), 'Receive answer');
  checkCurrent(token);
  record('subscribed', { userId: user.userId, kinds: specs.map((spec) => spec.type) });
}

function removeRemote(id) {
  const remote = remotes.get(id);
  if (!remote) return;
  remote.wrapper.close();
  for (const track of remote.stream.getTracks()) track.stop();
  remote.audioSource?.disconnect();
  remote.analyser?.disconnect();
  remote.silentGain?.disconnect();
  remote.video.srcObject = null;
  remote.figure.remove();
  remotes.delete(id);
}

function startHeartbeat() {
  const token = generation;
  heartbeatTimer = setInterval(() => request('heartbeat', { time: Date.now(), userName: userId })
    .catch((error) => { if (!closed && token === generation) fail(error); }), 3000);
}

async function join() {
  if (captureState !== 'preview' || closed) return;
  const token = generation;
  captureState = 'joining';
  controls('Joining ' + roomId);
  try {
    signaling = makeSignaling(token);
    await bounded(signaling.connect(endpoint), 'Signaling connection');
    checkCurrent(token);
    signalState = 'connected';
    const joined = await request('join', { userName: userId, audience: false });
    checkCurrent(token);
    signalState = 'joined';
    startHeartbeat();
    for (const user of joined.users ?? []) await subscribe(user);
    checkCurrent(token);
    publisher = new PCWrap({ direction: 'sendonly', iceServers: [] });
    publisher.setLocalStream(localStream);
    const offer = await bounded(publisher.createOfferAndEmit(), 'Publish offer');
    checkCurrent(token);
    const response = await request('push', { sdp: offer });
    checkCurrent(token);
    await bounded(publisher.getPeerConnection().setRemoteDescription({ type: 'answer', sdp: response.sdp }), 'Publish answer');
    checkCurrent(token);
    captureState = 'joined';
    controls(userId + ' joined ' + roomId);
    record('published');
  } catch (error) {
    if (token !== generation) return;
    await leave();
    captureState = 'error';
    fail(error);
  }
}

async function start() {
  await preview();
  if (mediaMode === 'synthetic') await join();
}

async function pcStats(wrapper) {
  const pc = wrapper?.getPeerConnection();
  if (!pc) return null;
  const reports = [...(await pc.getStats()).values()];
  const selectedIds = new Set(reports.filter((report) => report.type === 'transport').map((report) => report.selectedCandidatePairId));
  const selected = reports.filter((report) => report.type === 'candidate-pair' &&
    (selectedIds.has(report.id) || (report.nominated && report.state === 'succeeded')));
  const candidateIds = new Set(selected.flatMap((pair) => [pair.localCandidateId, pair.remoteCandidateId]));
  const wanted = ['inbound-rtp', 'outbound-rtp', 'transport', 'codec', 'candidate-pair'];
  return { connection: pc.connectionState, ice: pc.iceConnectionState,
    reports: reports.filter((report) => wanted.includes(report.type) || candidateIds.has(report.id))
      .map((report) => Object.fromEntries(Object.entries(report)
        .filter(([key]) => !['usernameFragment', 'iceLocalUsernameFragment'].includes(key)))) };
}

function audioSample(remote) {
  if (!remote.analyser) return null;
  const time = new Float32Array(remote.analyser.fftSize);
  remote.analyser.getFloatTimeDomainData(time);
  const sample = { rms: Math.sqrt(time.reduce((sum, value) => sum + value * value, 0) / time.length),
    context: audioContext.state, playing: !remote.video.paused };
  if (mediaMode === 'devices') return sample;
  const fft = new Float32Array(remote.analyser.frequencyBinCount);
  remote.analyser.getFloatFrequencyData(fft);
  let peak = 1;
  for (let i = 2; i < fft.length; i += 1) if (fft[i] > fft[peak]) peak = i;
  return { ...sample, peakHz: peak * audioContext.sampleRate / remote.analyser.fftSize, peakDb: fft[peak] };
}

function videoSample(video) {
  if (!video.videoWidth) return null;
  const sample = { width: video.videoWidth, height: video.videoHeight,
    totalVideoFrames: video.getVideoPlaybackQuality().totalVideoFrames };
  if (mediaMode === 'devices') return sample;
  const canvas = document.createElement('canvas');
  canvas.width = 32; canvas.height = 18;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let hash = 2166136261;
  for (const pixel of pixels) hash = Math.imul(hash ^ pixel, 16777619) >>> 0;
  return { ...sample, hash };
}

function publicEndpoint() {
  try {
    const url = new URL(endpoint);
    url.username = ''; url.password = ''; url.search = ''; url.hash = '';
    return url.href;
  } catch { return 'invalid'; }
}

async function snapshot() {
  const remoteResults = [];
  for (const [id, remote] of remotes) remoteResults.push({ userId: id,
    audio: audioSample(remote), video: videoSample(remote.video), stats: await pcStats(remote.wrapper) });
  return { at: Date.now(), userId, roomId, mediaMode, frequency: mediaMode === 'synthetic' ? frequency : undefined,
    endpoint: publicEndpoint(), signalState, captureState, currentError, secureContext: isSecureContext,
    errors: [...errors], events: [...events], publisher: await pcStats(publisher), remotes: remoteResults,
    localTracks: localStream?.getTracks().map((track) => ({ kind: track.kind, state: track.readyState })) ?? [] };
}

async function reconnectSignal() {
  const token = generation;
  checkCurrent(token);
  clearInterval(heartbeatTimer);
  signaling.close();
  await bounded(new Promise((resolve) => setTimeout(resolve, 1500)), 'Signaling reconnect delay');
  checkCurrent(token);
  await bounded(signaling.connect(endpoint), 'Signaling reconnection');
  checkCurrent(token);
  await request('join', { userName: userId, audience: false });
  checkCurrent(token);
  signalState = 'joined';
  startHeartbeat();
  record('signaling-only-rejoined');
}

function stopCollection(reason) {
  clearTimeout(collectionTimer);
  collectionTimer = undefined;
  if (collection.started && !collection.ended) Object.assign(collection, { ended: Date.now(), reason });
}

function collectStats() {
  if (captureState !== 'joined' || collectionTimer) return;
  collection = { started: Date.now(), intervalMs: 10000, durationMs: 600000, samples: [] };
  const token = generation;
  const sample = async () => {
    try {
      const state = await snapshot();
      if (closed || token !== generation) return;
      collection.samples.push(state);
      if (Date.now() - collection.started >= collection.durationMs || collection.samples.length >= 61) {
        stopCollection('completed');
        controls('10-minute statistics collection complete');
        return;
      }
      collectionTimer = setTimeout(sample, collection.intervalMs);
      controls();
    } catch (error) { stopCollection('failed'); fail(error); }
  };
  collectionTimer = setTimeout(sample, 0);
  controls();
}

async function exportStats() {
  const data = { exported: Date.now(), browser: navigator.userAgent, current: await snapshot(), collection };
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'meeting-stats-' + Date.now() + '.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function leave() {
  closed = true;
  generation += 1;
  for (const cancel of pending) cancel();
  clearInterval(heartbeatTimer);
  clearInterval(drawingTimer);
  stopCollection('left');
  const peers = [publisher, ...[...remotes.values()].map((remote) => remote.wrapper)]
    .map((wrapper) => wrapper?.getPeerConnection()).filter(Boolean);
  signaling?.close();
  publisher?.close();
  publisher = undefined;
  for (const id of [...remotes.keys()]) removeRemote(id);
  for (const track of localStream?.getTracks() ?? []) track.stop();
  oscillator?.stop();
  oscillator = undefined;
  localFigure?.querySelector('video')?.pause();
  const localVideo = localFigure?.querySelector('video');
  if (localVideo) localVideo.srcObject = null;
  localFigure?.remove();
  localFigure = undefined;
  const context = audioContext;
  if (context && context.state !== 'closed') await context.close();
  signalState = 'closed';
  captureState = 'closed';
  controls('Left ' + roomId);
  return { userId, peers: peers.map((pc) => pc.connectionState),
    tracks: localStream?.getTracks().map((track) => track.readyState) ?? [],
    audioContext: context?.state, signaling: signaling?.getState() ?? 'new', remotes: remotes.size };
}

window.baseline = { snapshot, preview, join, leave, reconnectSignal, collectStats, exportStats,
  collection: () => collection };
document.querySelector('#start').textContent = mediaMode === 'devices' ? 'Preview camera and microphone' : 'Start synthetic media';
document.querySelector('#join').hidden = mediaMode !== 'devices';
document.querySelector('#start').addEventListener('click', () => start().catch(fail));
document.querySelector('#join').addEventListener('click', () => join().catch(fail));
document.querySelector('#leave').addEventListener('click', () => leave().catch(fail));
document.querySelector('#collect').addEventListener('click', collectStats);
document.querySelector('#export-stats').addEventListener('click', () => exportStats().catch(fail));
window.addEventListener('pagehide', () => { void leave(); });
controls();
