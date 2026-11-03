"use client";

/**
 * Purpose: background piano music with a play/pause button (bottom left).
 *  - Never autoplays. Playback starts only from a click/tap: on the button, or on the FIRST click or key press
 *    anywhere if the visitor left music on last time (remembered in localStorage). That satisfies iOS Safari, which only
 *    allows audio to start inside a user gesture; play() is therefore called synchronously from the handler.
 *  - One shared audio element for the whole page (module singleton), so re-renders, strict mode and remounts can never
 *    create two players. The file loads only when playback starts (preload="none"); nothing is added to first load.
 *  - Pauses when the tab is hidden or the page is left. iOS ignores audio.volume (always 1), so the track itself is
 *    mastered quietly. Falls back to the generated pad (lib/ambient.ts) only if no audio file exists.
 * Inputs: src (public path, e.g. /audio/ambient.mp3). Used by: src/app/page.tsx.
 */
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AmbientSynth, audioSupported } from "@/lib/ambient";
import "@/styles/music.css";

const PREF_KEY = "portfolio:music";
const FILE_VOLUME = 0.85;

let sharedAudio: HTMLAudioElement | null = null;
let sharedSynth: AmbientSynth | null = null;
let fadeTimer = 0;

function readPref(): "on" | "off" | null {
  try {
    const v = window.localStorage.getItem(PREF_KEY);
    return v === "on" || v === "off" ? v : null;
  } catch {
    return null; // storage can be blocked (private mode)
  }
}

function writePref(value: "on" | "off") {
  try {
    window.localStorage.setItem(PREF_KEY, value);
  } catch {
    /* ignore */
  }
}

function getAudio(src: string): HTMLAudioElement {
  if (!sharedAudio) {
    sharedAudio = new Audio();
    sharedAudio.loop = true;
    sharedAudio.preload = "none";
    sharedAudio.setAttribute("playsinline", "");
  }
  if (!sharedAudio.src.endsWith(src)) sharedAudio.src = src;
  return sharedAudio;
}

function fade(el: HTMLAudioElement, to: number, then?: () => void) {
  window.clearInterval(fadeTimer);
  fadeTimer = window.setInterval(() => {
    const next = Math.min(1, Math.max(0, el.volume + (to > el.volume ? 0.03 : -0.03)));
    el.volume = next; // ignored on iOS, harmless
    if (Math.abs(next - to) < 0.031) {
      el.volume = to;
      window.clearInterval(fadeTimer);
      then?.();
    }
  }, 50);
}

/** Must be called synchronously from a click/keydown handler (iOS). */
async function startPlayback(src?: string): Promise<void> {
  if (src) {
    const el = getAudio(src);
    el.volume = 0;
    await el.play(); // first statement that can suspend: still inside the gesture
    fade(el, FILE_VOLUME);
    return;
  }
  sharedSynth ??= new AmbientSynth();
  await sharedSynth.start();
}

function stopPlayback(src?: string) {
  if (src && sharedAudio) {
    const el = sharedAudio;
    fade(el, 0, () => el.pause());
  } else {
    void sharedSynth?.stop();
  }
}

const noopSubscribe = () => () => {};

export function MusicPlayer({ src }: { src?: string }) {
  const supported = useSyncExternalStore(
    noopSubscribe,
    () => (src ? typeof Audio !== "undefined" : audioSupported()),
    () => true,
  );
  const [playing, setPlaying] = useState(false);
  const playingRef = useRef(false);

  function setState(next: boolean) {
    playingRef.current = next;
    setPlaying(next);
  }

  async function toggle() {
    if (playingRef.current) {
      setState(false);
      writePref("off");
      stopPlayback(src);
      return;
    }
    try {
      await startPlayback(src);
      setState(true);
      writePref("on");
    } catch {
      setState(false);
    }
  }

  // Resume after a reload if the visitor left music on: wait for their first click or key press (a real gesture).
  useEffect(() => {
    if (readPref() !== "on") return;
    const resume = (event: Event) => {
      remove();
      if ((event.target as Element | null)?.closest?.("[data-music-toggle]")) return; // the button handles itself
      startPlayback(src)
        .then(() => {
          playingRef.current = true;
          setPlaying(true);
        })
        .catch(() => {});
    };
    const remove = () => {
      document.removeEventListener("click", resume, true);
      document.removeEventListener("keydown", resume, true);
    };
    document.addEventListener("click", resume, true);
    document.addEventListener("keydown", resume, true);
    return remove;
  }, [src]);

  // Be polite: pause while the tab is hidden, resume when it is back (only if the music was on).
  useEffect(() => {
    const onVisibility = () => {
      if (!playingRef.current) return;
      if (document.hidden) stopPlayback(src);
      else startPlayback(src).catch(() => {});
    };
    const onHide = () => {
      if (playingRef.current) stopPlayback(src);
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onHide);
    };
  }, [src]);

  if (!supported) return null;

  return (
    <button
      type="button"
      data-music-toggle
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? "Pause background music" : "Play background music"}
      className="glass fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-5 z-40 inline-flex h-12 items-center gap-2 rounded-full px-4 text-sm text-fg transition-colors hover:bg-surface-hover"
    >
      <span className="eq" data-playing={playing} aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        {playing ? <path d="M6 5h4v14H6zM14 5h4v14h-4z" /> : <path d="M7 4l13 8-13 8z" />}
      </svg>
      <span className="hidden sm:inline">{playing ? "Pause music" : "Play music"}</span>
    </button>
  );
}
