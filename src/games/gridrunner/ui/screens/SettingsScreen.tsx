/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.
*/

"use client";

import { OverlayShell } from "../shared/OverlayShell";
import type { AudioSettings } from "../../engine/audio";

type SettingsScreenProps = Readonly<{
  onClose: () => void;
  audioSettings: AudioSettings;
  onAudioChange: (next: AudioSettings) => void;
}>;

function VolumeSlider({
  label, value, onChange,
}: Readonly<{ label: string; value: number; onChange: (v: number) => void }>) {
  return (
    <label className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="gr-font-mono text-xs tracking-wider text-[#aabbcc]">{label}</span>
        <span className="gr-font-mono text-xs tabular-nums text-[#00f0ff]">{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-[44px] w-full cursor-pointer accent-[#00f0ff]"
      />
    </label>
  );
}

export function SettingsScreen({ onClose, audioSettings, onAudioChange }: SettingsScreenProps) {
  function setField(field: keyof AudioSettings, value: number | boolean) {
    onAudioChange({ ...audioSettings, [field]: value });
  }

  return (
    <OverlayShell testId="gr-settings-overlay" title="SETTINGS" onClose={onClose} variant="dialog">
      <VolumeSlider label="MASTER" value={audioSettings.masterVolume} onChange={(v) => setField("masterVolume", v)} />
      <VolumeSlider label="MUSIC" value={audioSettings.musicVolume} onChange={(v) => setField("musicVolume", v)} />
      <VolumeSlider label="SFX" value={audioSettings.sfxVolume} onChange={(v) => setField("sfxVolume", v)} />

      <button
        type="button"
        onClick={() => setField("muted", !audioSettings.muted)}
        className={`gr-font-mono min-h-[44px] rounded-sm border px-3 py-2.5 text-sm font-bold tracking-widest active:brightness-150 ${
          audioSettings.muted
            ? "border-[#ff003c] bg-[#1a0a10] text-[#ff003c]"
            : "border-[#1a3a4a] bg-[#0f1b2d] text-[#aabbcc]"
        }`}
      >
        {audioSettings.muted ? "UNMUTE" : "MUTE ALL"}
      </button>

      <div className="gr-font-mono pt-1 text-center text-[10px] leading-tight text-[#1a3a4a]">
        Music by Karl Casey @ White Bat Audio
      </div>
    </OverlayShell>
  );
}
