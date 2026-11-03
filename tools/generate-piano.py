#!/usr/bin/env python3
"""
Original piano piece for the portfolio background music. Composed and synthesised here (additive piano model with
inharmonic partials, hammer noise, per-partial decay, soft room reverb). No samples, no third-party recording:
the composition and the sound are original and free to use on this site.

Run:  python3 tools/generate-piano.py   (needs numpy, scipy and ffmpeg)
Output: public/audio/ambient.mp3  (about 90 s, seamless-ish loop, quiet by design)
"""
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np
from scipy import signal

SR = 44100
BPM = 62
BEAT = 60.0 / BPM
rng = np.random.default_rng(20261103)

# ---- composition: Fmaj9 | Dm9 | Bbmaj9 | C(add9), two bars each, three passes (8 bars per pass) ----
# MIDI numbers. chord = (bass, fifth, upper tones for the arpeggio)
CHORDS = [
    (41, 48, [57, 60, 64, 67]),  # Fmaj9: F2 C3 | A3 C4 E4 G4
    (38, 45, [53, 57, 60, 64]),  # Dm9:   D2 A2 | F3 A3 C4 E4
    (46, 53, [62, 65, 69, 72]),  # Bbmaj9: Bb2 F3 | D4 F4 A4 C5
    (36, 43, [52, 55, 62, 64]),  # C(add9): C2 G2 | E3 G3 D4 E4
]
# melody per chord (beat offset within the 8 beats, midi, length in beats)
MELODY = [
    [(0, 72, 2.5), (2.5, 69, 1.5), (4, 67, 1), (5, 69, 3)],
    [(0, 74, 2.5), (2.5, 72, 1.5), (4, 69, 1), (5, 72, 3)],
    [(0, 77, 2.5), (2.5, 74, 1.5), (4, 72, 1), (5, 74, 3)],
    [(0, 76, 2.5), (2.5, 74, 1.5), (4, 71, 1), (5, 72, 3)],
]
ARP = [0, 2, 1, 3, 2, 3, 1, 2]  # eighth-note pattern over the upper chord tones
PASSES = 3
BARS_PER_CHORD = 2
BEATS_PER_BAR = 4
PASS_BEATS = len(CHORDS) * BARS_PER_CHORD * BEATS_PER_BAR
TOTAL = PASSES * PASS_BEATS * BEAT
TAIL = 4.0
N = int((TOTAL + TAIL) * SR)


def midi_hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def piano_note(freq, vel, dur):
    """One piano note as a mono array of `dur` seconds."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    b = 0.00012 * (freq / 110.0) ** 1.6  # inharmonicity: higher strings are stiffer
    t60 = float(np.clip(7.5 * (110.0 / freq) ** 0.35, 2.4, 9.0))
    tilt = 1.45 - 0.9 * vel
    out = np.zeros(n)
    for k in range(1, 15):
        fk = k * freq * np.sqrt(1 + b * k * k)
        if fk > 9000:
            break
        amp = vel ** 0.8 * k ** (-tilt)
        decay = 6.91 / (t60 / (1 + 0.6 * (k - 1)))  # ln(1000) / T60 for this partial
        env = np.exp(-decay * t)
        # two slightly detuned strings give the gentle beating of a real piano
        out += amp * env * (np.sin(2 * np.pi * fk * t) + 0.5 * np.sin(2 * np.pi * fk * 1.0004 * t + 0.7))
    # soft attack
    a = int(0.004 * SR)
    out[:a] *= 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, a))
    # hammer thump
    h = int(0.014 * SR)
    noise = rng.standard_normal(h) * np.hanning(h)
    sos = signal.butter(2, 2400, "low", fs=SR, output="sos")
    out[:h] += 0.035 * vel * signal.sosfilt(sos, noise)
    # fade the very end so nothing clicks
    f = int(0.25 * SR)
    out[-f:] *= np.linspace(1, 0, f)
    return out * 0.18


mix = np.zeros((N, 2))


def add(m, start_beat, vel, dur_s=None, humanize=True):
    freq = midi_hz(m)
    start = start_beat * BEAT + (rng.normal(0, 0.006) if humanize else 0.0)
    start = max(0.0, start)
    v = float(np.clip(vel * (1 + rng.normal(0, 0.07)), 0.05, 0.95))
    dur = dur_s if dur_s is not None else min(6.5, max(3.0, 8.5 * (110.0 / freq) ** 0.3))
    note = piano_note(freq, v, dur)
    pan = float(np.clip((m - 60) / 40.0, -0.6, 0.6))  # low notes left, high notes right
    left, right = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    i = int(start * SR)
    j = min(N, i + len(note))
    mix[i:j, 0] += note[: j - i] * left
    mix[i:j, 1] += note[: j - i] * right


for p in range(PASSES):
    for ci, (bass, fifth, upper) in enumerate(CHORDS):
        base = p * PASS_BEATS + ci * BARS_PER_CHORD * BEATS_PER_BAR
        for bar in range(BARS_PER_CHORD):
            bb = base + bar * BEATS_PER_BAR
            add(bass, bb, 0.42, dur_s=5.0)
            if bar == 0:
                add(fifth, bb + 2, 0.30, dur_s=4.0)
            # right hand: broken chord in eighths, softer in the first pass
            for e in range(8):
                vel = (0.32 if p == 0 else 0.28) + (0.06 if e % 4 == 0 else 0.0)
                add(upper[ARP[e]], bb + e * 0.5, vel, dur_s=2.6)
        if p >= 1:  # melody enters in the second pass, an octave lower echo in the third
            for off, m, ln in MELODY[ci]:
                add(m, base + off, 0.55 if p == 1 else 0.48, dur_s=5.0)
                if p == 2:
                    add(m - 12, base + off + 0.02, 0.26, dur_s=4.0)

# ---- master chain: gentle filtering + soft room ----
hp = signal.butter(2, 40, "high", fs=SR, output="sos")
lp = signal.butter(2, 7000, "low", fs=SR, output="sos")
dry = signal.sosfilt(lp, signal.sosfilt(hp, mix, axis=0), axis=0)

ir_len = int(2.8 * SR)
t = np.arange(ir_len) / SR
ir = np.zeros((ir_len, 2))
for c in range(2):
    ir[:, c] = rng.standard_normal(ir_len) * np.exp(-t / 0.62)
    ir[:, c] = signal.sosfilt(signal.butter(2, 4800, "low", fs=SR, output="sos"), ir[:, c])
ir /= np.sqrt((ir ** 2).sum(axis=0, keepdims=True))
pre = int(0.018 * SR)
wet = np.zeros_like(dry)
for c in range(2):
    wet[pre:, c] = signal.fftconvolve(dry[:, c], ir[:, c])[: N - pre]
# keep the room clean: no low-frequency build-up in the reverb
wet = signal.sosfilt(signal.butter(2, 200, "high", fs=SR, output="sos"), wet, axis=0)
out = 0.85 * dry + 0.40 * wet

# ---- make it loop: fold the reverb tail onto the start ----
loop_n = int(TOTAL * SR)
body = out[:loop_n].copy()
tail = out[loop_n:]
body[: len(tail)] += tail
out = body

# ---- level: quiet on purpose (background) ----
out -= out.mean(axis=0, keepdims=True)
peak = np.abs(out).max()
out *= 0.30 / peak
rms_db = 20 * np.log10(np.sqrt((out ** 2).mean()))
print(f"duration {len(out)/SR:.1f}s  peak {20*np.log10(0.30):.1f} dBFS  rms {rms_db:.1f} dBFS")

wav = Path("/tmp/piano.wav")
with wave.open(str(wav), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(out, -1, 1) * 32767).astype("<i2").tobytes())

dest = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("public/audio/ambient.mp3")
dest.parent.mkdir(parents=True, exist_ok=True)
subprocess.run(
    ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-c:a", "libmp3lame", "-b:a", "96k", "-ar", "44100", str(dest)],
    check=True,
)
print("wrote", dest, f"{dest.stat().st_size/1024:.0f} KiB")
