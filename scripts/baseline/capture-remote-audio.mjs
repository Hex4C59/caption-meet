import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

export async function captureRemoteAudio(page, output, sender = 'bob') {
  const captured = await page.evaluate(async ({ sender }) => {
    const figure = [...document.querySelectorAll('figure')].find((entry) =>
      entry.querySelector('figcaption')?.textContent === `Remote ${sender}`);
    const track = figure?.querySelector('video')?.srcObject?.getAudioTracks()[0];
    if (!track || track.readyState !== 'live') throw new Error('Remote audio track is not live');
    const context = new AudioContext({ sampleRate: 48000 });
    const frames = context.sampleRate * 2;
    const sourceText = `class Capture extends AudioWorkletProcessor {
      constructor(options) { super(); this.remaining = options.processorOptions.frames; }
      process(inputs) {
        const input = inputs[0]?.[0];
        if (input && this.remaining > 0) {
          const chunk = input.slice(0, Math.min(input.length, this.remaining));
          this.remaining -= chunk.length;
          this.port.postMessage(chunk, [chunk.buffer]);
          if (this.remaining === 0) { this.port.postMessage({ done: true }); return false; }
        }
        return true;
      }
    }
    registerProcessor('wi002-received-pcm', Capture);`;
    const moduleUrl = URL.createObjectURL(new Blob([sourceText], { type: 'text/javascript' }));
    let node;
    let source;
    let deadline;
    try {
      await context.audioWorklet.addModule(moduleUrl);
      await context.resume();
      node = new AudioWorkletNode(context, 'wi002-received-pcm', { processorOptions: { frames } });
      source = context.createMediaStreamSource(new MediaStream([track]));
      const chunks = [];
      const complete = new Promise((resolve, reject) => {
        deadline = setTimeout(() => reject(new Error('Remote PCM capture timed out')), 10000);
        node.onprocessorerror = () => reject(new Error('Remote PCM worklet failed'));
        node.port.onmessage = ({ data }) => {
          if (data.done) resolve();
          else chunks.push(data);
        };
      });
      source.connect(node).connect(context.destination);
      await complete;
      const samples = new Float32Array(frames);
      let offset = 0;
      for (const chunk of chunks) { samples.set(chunk, offset); offset += chunk.length; }
      return { sampleRate: context.sampleRate, samples: Array.from(samples), trackState: track.readyState };
    } finally {
      clearTimeout(deadline);
      source?.disconnect();
      node?.disconnect();
      node?.port.close();
      await context.close();
      URL.revokeObjectURL(moduleUrl);
    }
  }, { sender });

  const { samples, sampleRate } = captured;
  const durationSeconds = samples.length / sampleRate;
  const rms = Math.sqrt(samples.reduce((sum, sample) => sum + sample * sample, 0) / samples.length);
  let positiveCrossings = 0;
  const first = Math.floor(sampleRate * 0.25);
  const last = Math.floor(sampleRate * 1.75);
  for (let i = first + 1; i < last; i += 1) if (samples[i - 1] <= 0 && samples[i] > 0) positiveCrossings += 1;
  const measuredHz = positiveCrossings / ((last - first) / sampleRate);
  assert.equal(durationSeconds, 2);
  assert(rms > 0.005, 'captured remote PCM must contain sound');
  assert(Math.abs(measuredHz - 660) < 5, 'Alice must capture the actual Bob 660 Hz track');
  const wave = Buffer.alloc(44 + samples.length * 2);
  wave.write('RIFF', 0); wave.writeUInt32LE(wave.length - 8, 4); wave.write('WAVEfmt ', 8);
  wave.writeUInt32LE(16, 16); wave.writeUInt16LE(1, 20); wave.writeUInt16LE(1, 22);
  wave.writeUInt32LE(sampleRate, 24); wave.writeUInt32LE(sampleRate * 2, 28);
  wave.writeUInt16LE(2, 32); wave.writeUInt16LE(16, 34); wave.write('data', 36);
  wave.writeUInt32LE(samples.length * 2, 40);
  for (let i = 0; i < samples.length; i += 1) {
    wave.writeInt16LE(Math.round(Math.max(-1, Math.min(1, samples[i])) * 32767), 44 + i * 2);
  }
  const filename = 'alice-receives-bob.wav';
  await fs.writeFile(path.join(output, filename), wave);
  const metadata = { filename, receiver: 'alice', sender, sampleRate, channels: 1,
    sampleCount: samples.length, durationSeconds, rms, measuredHz, trackState: captured.trackState,
    source: 'AudioWorklet samples from the actual remote RTC audio track; synthetic test media only' };
  await fs.writeFile(path.join(output, 'remote-audio.json'), JSON.stringify(metadata, null, 2));
  return metadata;
}
