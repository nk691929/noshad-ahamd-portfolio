/**
 * Purpose: an original ambient background pad generated with the Web Audio API (no audio file, no licence, nothing to
 * download). Four slow chords on soft oscillators through a drifting low-pass filter and a synthetic reverb.
 * It only starts from a user click (browsers block autoplay with sound). Client only.
 * Used by: components/ui/music-player.tsx. Drop public/audio/ambient.mp3 to use your own track instead.
 */

/** Dm9, Bbmaj9, Gm9, Am(add9)/C as frequencies in Hz. */
export const CHORDS: readonly (readonly number[])[] = [
  [146.83, 220.0, 261.63, 329.63],
  [116.54, 174.61, 261.63, 293.66],
  [98.0, 146.83, 220.0, 233.08],
  [110.0, 164.81, 246.94, 261.63],
];

const CHORD_SECONDS = 14;

type AudioContextCtor = typeof AudioContext;

export function audioSupported(): boolean {
  const w = window as unknown as {
    AudioContext?: AudioContextCtor;
    webkitAudioContext?: AudioContextCtor;
  };
  return Boolean(w.AudioContext ?? w.webkitAudioContext);
}

function impulse(ctx: AudioContext, seconds: number): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < length; i++)
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.6);
  }
  return buffer;
}

export class AmbientSynth {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private voices: OscillatorNode[] = [];
  private timer = 0;
  private chord = 0;

  async start(volume = 0.16): Promise<void> {
    if (!this.ctx) this.build();
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    await ctx.resume();
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(volume, ctx.currentTime, 0.7);
    if (!this.timer) this.timer = window.setInterval(() => this.nextChord(), CHORD_SECONDS * 1000);
  }

  async stop(): Promise<void> {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.35);
    window.clearInterval(this.timer);
    this.timer = 0;
    window.setTimeout(() => {
      if (this.timer === 0) void ctx.suspend();
    }, 1400);
  }

  dispose(): void {
    window.clearInterval(this.timer);
    this.timer = 0;
    this.voices.forEach((v) => {
      try {
        v.stop();
      } catch {
        /* already stopped */
      }
    });
    this.voices = [];
    void this.ctx?.close();
    this.ctx = null;
    this.master = null;
  }

  private nextChord() {
    const ctx = this.ctx;
    if (!ctx) return;
    this.chord = (this.chord + 1) % CHORDS.length;
    const notes = CHORDS[this.chord] ?? [];
    this.voices.forEach((voice, i) => {
      const base = notes[i % notes.length] ?? 220;
      const octave = i >= notes.length ? 2 : 1;
      voice.frequency.setTargetAtTime(base * octave, ctx.currentTime, 2.8);
    });
  }

  private build() {
    const w = window as unknown as {
      AudioContext?: AudioContextCtor;
      webkitAudioContext?: AudioContextCtor;
    };
    const Ctor = w.AudioContext ?? w.webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    const reverb = ctx.createConvolver();
    reverb.buffer = impulse(ctx, 2.6);
    const wet = ctx.createGain();
    wet.gain.value = 0.55;
    reverb.connect(wet).connect(master);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    filter.Q.value = 0.4;
    const dry = ctx.createGain();
    dry.gain.value = 0.7;
    filter.connect(dry).connect(master);
    filter.connect(reverb);

    // slow breathing of the filter
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.045;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 320;
    lfo.connect(lfoDepth).connect(filter.frequency);
    lfo.start();

    const first = CHORDS[0] ?? [];
    const types: OscillatorType[] = [
      "triangle",
      "sine",
      "triangle",
      "sine",
      "sine",
      "sine",
      "sine",
      "sine",
    ];
    types.forEach((type, i) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      const base = first[i % first.length] ?? 220;
      osc.frequency.value = base * (i >= first.length ? 2 : 1);
      osc.detune.value = (i % 2 === 0 ? 1 : -1) * (3 + i);
      const gain = ctx.createGain();
      gain.gain.value = i >= first.length ? 0.05 : 0.17;
      osc.connect(gain).connect(filter);
      osc.start();
      this.voices.push(osc);
    });

    this.ctx = ctx;
    this.master = master;
  }
}
