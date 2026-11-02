"use client";

/**
 * Purpose: background music with a play/pause button (bottom left). Never autoplays: music starts only when the
 * visitor presses play. Uses public/audio/ambient.(mp3|ogg|m4a|wav) when it exists, otherwise the generated ambient
 * pad (lib/ambient.ts). Fades in and out, pauses when the tab is hidden, and hides itself if audio is unsupported.
 * Inputs: src (public path of an audio file, optional). Used by: src/app/page.tsx.
 */
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AmbientSynth, audioSupported } from "@/lib/ambient";
import "@/styles/music.css";

const FILE_VOLUME = 0.3;
const noopSubscribe = () => () => {};

export function MusicPlayer({ src }: { src?: string }) {
  const supported = useSyncExternalStore(
    noopSubscribe,
    () => Boolean(src) || audioSupported(),
    () => true,
  );
  const [playing, setPlaying] = useState(false);
  const playingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const synthRef = useRef<AmbientSynth | null>(null);
  const fadeRef = useRef(0);

  function fadeAudio(el: HTMLAudioElement, to: number, then?: () => void) {
    window.clearInterval(fadeRef.current);
    fadeRef.current = window.setInterval(() => {
      const step = to > el.volume ? 0.02 : -0.02;
      const next = Math.min(1, Math.max(0, el.volume + step));
      el.volume = next;
      if (Math.abs(next - to) < 0.021) {
        el.volume = to;
        window.clearInterval(fadeRef.current);
        then?.();
      }
    }, 40);
  }

  async function begin() {
    if (src && audioRef.current) {
      const el = audioRef.current;
      el.volume = 0;
      await el.play();
      fadeAudio(el, FILE_VOLUME);
    } else {
      synthRef.current ??= new AmbientSynth();
      await synthRef.current.start();
    }
  }

  async function end() {
    if (src && audioRef.current) {
      const el = audioRef.current;
      fadeAudio(el, 0, () => el.pause());
    } else {
      await synthRef.current?.stop();
    }
  }

  async function toggle() {
    if (playingRef.current) {
      playingRef.current = false;
      setPlaying(false);
      await end();
    } else {
      try {
        await begin();
        playingRef.current = true;
        setPlaying(true);
      } catch {
        playingRef.current = false;
        setPlaying(false);
      }
    }
  }

  // Be polite: pause while the tab is hidden, resume when it returns (only if music was on).
  useEffect(() => {
    const onVisibility = () => {
      if (!playingRef.current) return;
      if (document.hidden) void end();
      else void begin();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearInterval(fadeRef.current);
      synthRef.current?.dispose();
      synthRef.current = null;
    };
    // begin/end read refs and props only; they are intentionally not dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  if (!supported) return null;

  return (
    <>
      {src ? <audio ref={audioRef} src={src} loop preload="none" /> : null}
      <button
        type="button"
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
    </>
  );
}
