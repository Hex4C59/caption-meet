import PCWrap from 'upstream-client/peerConnectionWrap/PCWrap.ts';
import ProtooClientWrap from 'upstream-client/peerConnectionWrap/ProtooClientWrap.ts';

const roomId = new URLSearchParams(location.search).get('room');
const userId = 'expiry-probe';
const signaling = new ProtooClientWrap();
const publications = [];
let context;
let source;
let stream;
let heartbeat;
let cleanupResult;
const errors = [];

async function request(method, extra = {}) {
  const result = await signaling.sendRequest(method, { roomId, userId, ...extra });
  if (result.code !== 0) throw new Error(method + ': ' + result.code);
  return result;
}

document.querySelector('#start').onclick = async () => {
  if (context) return;
  context = new AudioContext({ sampleRate: 48000 });
  source = context.createOscillator();
  source.frequency.value = 440;
  const destination = context.createMediaStreamDestination();
  source.connect(destination);
  source.start();
  stream = destination.stream;
  await context.resume();
  window.preStun.ready = true;
};

async function join() {
  await signaling.connect('ws://127.0.0.1:18080/webrtc');
  await request('join', { userName: userId, audience: false });
  heartbeat = setInterval(() => request('heartbeat', { time: Date.now() }).catch((error) => errors.push(String(error))), 3000);
}

async function publish() {
  const wrapper = new PCWrap({ direction: 'sendonly', iceServers: [] });
  // PCWrap.close() owns its tracks; closing one publication must not stop the source.
  wrapper.setLocalStream(stream.clone());
  const index = publications.push({ wrapper, answer: null }) - 1;
  const offer = await wrapper.createOfferAndEmit();
  const answer = await request('push', { sdp: offer });
  publications[index].answer = answer.sdp;
  return index;
}

async function connect(index) {
  const publication = publications[index];
  await publication.wrapper.getPeerConnection().setRemoteDescription({ type: 'answer', sdp: publication.answer });
}

async function snapshot(index) {
  const pc = publications[index].wrapper.getPeerConnection();
  const stats = [...(await pc.getStats()).values()];
  return {
    connection: pc.connectionState, ice: pc.iceConnectionState,
    packetsSent: stats.filter(x => x.type === 'outbound-rtp').reduce((n, x) => n + (x.packetsSent ?? 0), 0),
    stunRequestsSent: stats.filter(x => x.type === 'candidate-pair').reduce((n, x) => n + (x.requestsSent ?? 0), 0),
  };
}

async function cleanup() {
  if (cleanupResult) return cleanupResult;
  clearInterval(heartbeat);
  const peers = publications.map(({ wrapper }) => wrapper.getPeerConnection()).filter(Boolean);
  const tracks = publications.flatMap(({ wrapper }) => wrapper.getLocalStream()?.getTracks() ?? []);
  tracks.push(...(stream?.getTracks() ?? []));
  for (const publication of publications) publication.wrapper.close();
  signaling.close();
  for (const track of tracks) track.stop();
  source?.stop();
  if (context && context.state !== 'closed') await context.close();
  cleanupResult = { peers: peers.map((pc) => pc.connectionState), tracks: tracks.map((track) => track.readyState),
    signaling: signaling.getState(), audioContext: context?.state ?? 'not-created' };
  return cleanupResult;
}

window.preStun = { ready: false, join, publish, connect, snapshot, cleanup, errors,
  closeMedia: (index) => publications[index].wrapper.close() };
