# Background music

- **Track:** `public/audio/ambient.mp3` (about 93 seconds, 1.1 MB, mastered quietly: peak -10.5 dBFS, about -27 dBFS RMS).
- **Origin and licence:** an original piece (Fmaj9, Dm9, Bbmaj9, Cadd9; three passes: arpeggios, then melody, then an
  octave echo) composed and rendered by `tools/generate-piano.py` with numpy and ffmpeg. It is synthesised, not a
  recording of a real piano, so the timbre is soft and slightly "digital". No third-party audio or samples are used, so
  there is nothing to license. To use a real recording instead, replace the file (keep the name, or use `.ogg/.m4a/.wav`),
  and make sure you hold the licence.
- **Regenerate:** `python3 tools/generate-piano.py` (change the chords, tempo or seed at the top of the script).
- **Behaviour:** never autoplays; starts from a tap on the button; remembers "on/off" in `localStorage` and, if it was on,
  starts on the first tap or key press of the next visit; pauses when the tab is hidden; a single shared audio element
  prevents duplicates; the file is only requested when playback starts.
- **iOS Safari:** audio can only start inside a user gesture, so `play()` is called directly from the click handler.
  iOS ignores `audio.volume`, which is why the track itself is quiet. HTML audio is not muted by the ringer switch.
