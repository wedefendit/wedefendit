/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.
*/

import { useCallback, useEffect, useState } from "react";
import type { GameScreen } from "../engine/types";
import type { AudioSettings, SfxId } from "../engine/audio";
import {
  initAudio,
  destroyAudio,
  playSfx,
  playMusic,
  stopMusicPlayback,
  pauseAudio,
  resumeAudio,
  updateSettings,
  getSettings,
  getMusicSlot,
  getCurrentTrackName,
} from "../engine/audio";

/* ------------------------------------------------------------------ */
/*  Hook                                                              */
/* ------------------------------------------------------------------ */

export function useAudio(
  screen: GameScreen,
  zone: string,
  isBoss: boolean,
  isPaused: boolean,
) {
  const [trackName, setTrackName] = useState<string | null>(null);
  const [settings, setSettings] = useState<AudioSettings>(getSettings);
  const [isReady, setIsReady] = useState(false);

  /* ---- Init on first user interaction ---- */
  useEffect(() => {
    function handleInteraction() {
      if (isReady) return;
      initAudio();
      setIsReady(true);
      setSettings(getSettings());
      globalThis.removeEventListener("click", handleInteraction);
      globalThis.removeEventListener("keydown", handleInteraction);
      globalThis.removeEventListener("touchstart", handleInteraction);
    }

    globalThis.addEventListener("click", handleInteraction);
    globalThis.addEventListener("keydown", handleInteraction);
    globalThis.addEventListener("touchstart", handleInteraction);

    return () => {
      globalThis.removeEventListener("click", handleInteraction);
      globalThis.removeEventListener("keydown", handleInteraction);
      globalThis.removeEventListener("touchstart", handleInteraction);
    };
  }, [isReady]);

  /* ---- Cleanup on unmount ---- */
  useEffect(() => {
    return () => {
      destroyAudio();
    };
  }, []);

  /* ---- Music: react to game state changes ---- */
  useEffect(() => {
    if (!isReady) return;

    const slot = getMusicSlot(screen, zone, isBoss);
    if (slot) {
      playMusic(slot);

      /* Poll briefly for track name since loadBuffer is async */
      const poll = setInterval(() => {
        const current = getCurrentTrackName();
        if (current) {
          setTrackName(current);
          clearInterval(poll);
        }
      }, 200);

      return () => clearInterval(poll);
    } else {
      stopMusicPlayback();
      setTrackName(null);
    }
  }, [screen, zone, isBoss, isReady]);

  /* ---- Pause / Resume ---- */
  useEffect(() => {
    if (!isReady) return;
    if (isPaused) {
      pauseAudio();
    } else {
      resumeAudio();
    }
  }, [isPaused, isReady]);

  /* ---- Settings update ---- */
  const handleSettingsChange = useCallback((next: AudioSettings) => {
    updateSettings(next);
    setSettings({ ...next });
  }, []);

  /* ---- SFX trigger ---- */
  const sfx = useCallback((id: SfxId) => {
    playSfx(id);
  }, []);

  return {
    sfx,
    trackName,
    settings,
    onSettingsChange: handleSettingsChange,
  };
}
