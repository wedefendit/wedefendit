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
  getMusicSlot,
  getCurrentTrackName,
  loadAudioSettings,
} from "../engine/audio";

enum AudioGestureEvent {
  Click = "click",
  KeyDown = "keydown",
  TouchStart = "touchstart",
}

const TRACK_NAME_POLL_INTERVAL_MS = 200;

export function useAudio(
  screen: GameScreen,
  zone: string,
  isBoss: boolean,
  isPaused: boolean,
) {
  const [track, setTrack] = useState<{ slot: string; name: string } | null>(null);
  const [settings, setSettings] = useState<AudioSettings>(loadAudioSettings);

  useEffect(() => {
    initAudio();

    function handleGesture() {
      resumeAudio();
      for (const event of Object.values(AudioGestureEvent)) {
        globalThis.removeEventListener(event, handleGesture);
      }
    }

    for (const event of Object.values(AudioGestureEvent)) {
      globalThis.addEventListener(event, handleGesture);
    }

    return () => {
      for (const event of Object.values(AudioGestureEvent)) {
        globalThis.removeEventListener(event, handleGesture);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      destroyAudio();
    };
  }, []);

  useEffect(() => {
    const slot = getMusicSlot(screen, zone, isBoss);
    if (slot) {
      playMusic(slot);

      const poll = setInterval(() => {
        const current = getCurrentTrackName();
        if (current) {
          setTrack({ slot, name: current });
          clearInterval(poll);
        }
      }, TRACK_NAME_POLL_INTERVAL_MS);

      return () => clearInterval(poll);
    } else {
      stopMusicPlayback();
    }
  }, [screen, zone, isBoss]);

  useEffect(() => {
    if (isPaused) {
      pauseAudio();
    } else {
      resumeAudio();
    }
  }, [isPaused]);

  const handleSettingsChange = useCallback((next: AudioSettings) => {
    updateSettings(next);
    setSettings({ ...next });
  }, []);

  const sfx = useCallback((id: SfxId) => {
    playSfx(id);
  }, []);

  return {
    sfx,
    trackName: track?.slot === getMusicSlot(screen, zone, isBoss) ? track.name : null,
    settings,
    onSettingsChange: handleSettingsChange,
  };
}
