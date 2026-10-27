import { GameScreenValue, type GameScreen } from "./types";

export enum SfxIdValue { Step = "step", MenuOpen = "menu-open", MenuClose = "menu-close", Bits = "bits", LevelUp = "level-up", LootDrop = "loot-drop", Encounter = "encounter", Hit = "hit", Miss = "miss", Critical = "critical", ToolRecon = "tool-recon", ToolExploit = "tool-exploit", ToolDefense = "tool-defense", ToolPersistence = "tool-persistence" }
export type SfxId = `${SfxIdValue}`;

export enum MusicSlotValue { Title = "title", Overworld = "overworld", InteriorSafe = "interior-safe", InteriorDeep = "interior-deep", Battle = "battle", Boss = "boss", Final = "final" }
export type MusicSlot = `${MusicSlotValue}`;

export interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
}

const AUDIO_SETTINGS_KEY = "dis-gridrunner-audio";
const CROSSFADE_MS = 1500;
const MILLISECONDS_PER_SECOND = 1000;
const SOURCE_CLEANUP_GRACE_MS = 100;
const VOLUME_MIN = 0;
const VOLUME_MAX = 100;

enum AudioContextStateValue { Running = "running", Closed = "closed", Suspended = "suspended" }
enum AudioErrorValue { EmptyPool = "Cannot pick from empty pool" }

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  masterVolume: 78,
  musicVolume: 45,
  sfxVolume: 42,
  muted: false,
};
export const SFX_MANIFEST: Record<SfxId, readonly string[]> = {
  [SfxIdValue.Step]: ["/audio/sfx/step/UIClick_UI Click 33_CB Sounddesign_ACTIVATION2.wav"],
  [SfxIdValue.MenuOpen]: [
    "/audio/sfx/menu-open/UIMisc_Feedback 36 up_CB Sounddesign_ACTIVATION2.wav",
  ],
  [SfxIdValue.MenuClose]: [
    "/audio/sfx/menu-close/Bluezone_BC0304_retrofuturistic_computer_button_013.wav",
    "/audio/sfx/menu-close/UIClick_UI Click 33_CB Sounddesign_ACTIVATION2.wav",
    "/audio/sfx/menu-close/UI_Window_MEDIUM_SlideMetal_02_CLOSED.wav",
  ],
  [SfxIdValue.Bits]: [
    "/audio/sfx/bits/Bluezone_BC0303_futuristic_user_interface_high_tech_beep_038.wav",
  ],
  [SfxIdValue.LevelUp]: ["/audio/sfx/level-up/UIAlert_Confirm Middle 12_RSCPC_USIN.wav"],
  [SfxIdValue.LootDrop]: [
    "/audio/sfx/loot-drop/TOONPop_Syringe Pop 4_RogueWaves_KawaiiUI.wav",
  ],
  [SfxIdValue.Encounter]: [
    "/audio/sfx/encounter/Bluezone_BC0303_futuristic_user_interface_data_glitch_003.wav",
    "/audio/sfx/encounter/Bluezone_BC0299_electricity_surge_discharge_electrical_arc_crackling_002_01.wav",
  ],
  [SfxIdValue.Hit]: [
    "/audio/sfx/hit/Bluezone_BC0297_stone_impact_hammer_015.wav",
    "/audio/sfx/hit/FGHTImpt_Fight Combo x4_RogueWaves_AnimeStudio.wav",
    "/audio/sfx/hit/SCIMech_Mech Processed Metal 27_RSCPC_SFEW.wav",
  ],
  [SfxIdValue.Miss]: [
    "/audio/sfx/miss/Bluezone_BC0300_alien_interface_sci_fi_transition_004.wav",
    "/audio/sfx/miss/Bluezone_BC0300_alien_interface_sci_fi_transition_008.wav",
    "/audio/sfx/miss/Bluezone_BC0303_futuristic_user_interface_transition_006.wav",
  ],
  [SfxIdValue.Critical]: [
    "/audio/sfx/critical/Bluezone_BC0294_modern_cinematic_impact_percussion_009.wav",
  ],
  [SfxIdValue.ToolRecon]: [
    "/audio/sfx/tool-recon/Bluezone_BC0300_alien_interface_sci_fi_texture_003.wav",
    "/audio/sfx/tool-recon/SCIMisc_Ping 18_RSCPC_PX.wav",
  ],
  [SfxIdValue.ToolExploit]: [
    "/audio/sfx/tool-exploit/Bluezone_BC0295_sci_fi_weapon_gun_shot_008.wav",
    "/audio/sfx/tool-exploit/Bluezone_BC0296_steampunk_weapon_flare_shot_explosion_003.wav",
    "/audio/sfx/tool-exploit/SCIMisc_Zap Short 14_RSCPC_PX.wav",
    "/audio/sfx/tool-exploit/WEAPSwrd_Mecha Energy Sword Cut_RogueWaves_AnimeStudio.wav",
  ],
  [SfxIdValue.ToolDefense]: [
    "/audio/sfx/tool-defense/DSGNMisc_Charge Down Classic 1_RogueWaves_AnimeStudio.wav",
  ],
  [SfxIdValue.ToolPersistence]: [
    "/audio/sfx/tool-persistence/Bluezone_BC0299_electricity_texture_sizzling_crackling_006.wav",
    "/audio/sfx/tool-persistence/Bluezone_BC0300_alien_interface_sci_fi_texture_003.wav",
    "/audio/sfx/tool-persistence/Bluezone_BC0300_alien_interface_sci_fi_texture_046.wav",
  ],
};

export const MUSIC_MANIFEST: Record<MusicSlot, readonly string[]> = {
  [MusicSlotValue.Title]: ["/audio/music/title/Karl Casey - Malibu Moon.mp3"],
  [MusicSlotValue.Overworld]: [
    "/audio/music/overworld/Karl Casey - Eternal Youth.mp3",
    "/audio/music/overworld/Karl Casey - Midnight Empire.mp3",
    "/audio/music/overworld/Karl Casey - Moonlight.mp3",
    "/audio/music/overworld/Karl Casey - Nightscapes.mp3",
    "/audio/music/overworld/Karl Casey - Sunset Drive.mp3",
  ],
  [MusicSlotValue.InteriorSafe]: [
    "/audio/music/interior-safe/Karl Casey - Aurora.mp3",
    "/audio/music/interior-safe/Karl Casey - Conspiracy.mp3",
    "/audio/music/interior-safe/Karl Casey - Crystal Cola.mp3",
    "/audio/music/interior-safe/Karl Casey - Headlights in the Fog.mp3",
    "/audio/music/interior-safe/Karl Casey - Slice of Paradise.mp3",
  ],
  [MusicSlotValue.InteriorDeep]: [
    "/audio/music/interior-deep/Karl Casey - Ghost in the Algorithm.mp3",
    "/audio/music/interior-deep/Karl Casey - Mysterious Transmission.mp3",
    "/audio/music/interior-deep/Karl Casey - Secret Society.mp3",
    "/audio/music/interior-deep/Karl Casey - Surveillance.mp3",
    "/audio/music/interior-deep/Karl Casey - The Stalker.mp3",
  ],
  [MusicSlotValue.Battle]: [
    "/audio/music/battle/Karl Casey - Burnt Circuit.mp3",
    "/audio/music/battle/Karl Casey - Chrome Cobra.mp3",
    "/audio/music/battle/Karl Casey - Cosmic Death Machine.mp3",
    "/audio/music/battle/Karl Casey - Gears of War.mp3",
    "/audio/music/battle/Karl Casey - Kiss of Death.mp3",
  ],
  [MusicSlotValue.Boss]: [
    "/audio/music/boss/Karl Casey - Dead Channel.mp3",
    "/audio/music/boss/Karl Casey - Soul Eater.mp3",
    "/audio/music/boss/Karl Casey - The Taste of Blood.mp3",
  ],
  [MusicSlotValue.Final]: ["/audio/music/final/Karl Casey - Nemesis.mp3"],
};

const ZONE_MUSIC: Record<string, MusicSlot> = {
  arcade: MusicSlotValue.InteriorSafe,
  bank: MusicSlotValue.InteriorDeep,
  hospital: MusicSlotValue.InteriorDeep,
  powerplant: MusicSlotValue.InteriorDeep,
  government: MusicSlotValue.InteriorDeep,
  portauthority: MusicSlotValue.InteriorDeep,
  university: MusicSlotValue.InteriorSafe,
  oilrefinery: MusicSlotValue.InteriorDeep,
  telecomtower: MusicSlotValue.InteriorDeep,
  datacenter: MusicSlotValue.InteriorDeep,
  satellitestation: MusicSlotValue.InteriorDeep,
  embassy: MusicSlotValue.InteriorDeep,
  researchlab: MusicSlotValue.InteriorDeep,
  gridcore: MusicSlotValue.InteriorDeep,
};

export function pickRandom<T>(pool: readonly T[]): T {
  if (pool.length === 0) throw new Error(AudioErrorValue.EmptyPool);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function resolveTrackName(path: string): string {
  const filename = path.split("/").pop() ?? path;
  const withoutExt = filename.replace(/\.[^.]+$/, "");
  const dashIndex = withoutExt.indexOf(" - ");
  if (dashIndex >= 0) {
    return withoutExt.slice(dashIndex + 3);
  }
  return withoutExt;
}

export function getMusicSlot(
  screen: GameScreen,
  zone: string,
  isBoss: boolean,
): MusicSlot | null {
  if (screen === GameScreenValue.Title) return screen;
  if (screen === GameScreenValue.Overworld) return screen;
  if (screen === GameScreenValue.Battle) {
    return isBoss ? MusicSlotValue.Boss : MusicSlotValue.Battle;
  }
  if (screen === GameScreenValue.Building) {
    return ZONE_MUSIC[zone] ?? MusicSlotValue.InteriorSafe;
  }
  return null;
}

export function loadAudioSettings(): AudioSettings {
  try {
    const raw = localStorage.getItem(AUDIO_SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_AUDIO_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<AudioSettings>;
    return {
      masterVolume:
        typeof parsed.masterVolume === "number"
          ? parsed.masterVolume
          : DEFAULT_AUDIO_SETTINGS.masterVolume,
      musicVolume:
        typeof parsed.musicVolume === "number"
          ? parsed.musicVolume
          : DEFAULT_AUDIO_SETTINGS.musicVolume,
      sfxVolume:
        typeof parsed.sfxVolume === "number"
          ? parsed.sfxVolume
          : DEFAULT_AUDIO_SETTINGS.sfxVolume,
      muted:
        typeof parsed.muted === "boolean"
          ? parsed.muted
          : DEFAULT_AUDIO_SETTINGS.muted,
    };
  } catch {
    return { ...DEFAULT_AUDIO_SETTINGS };
  }
}

export function saveAudioSettings(settings: AudioSettings): void {
  try {
    localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let settings: AudioSettings = { ...DEFAULT_AUDIO_SETTINGS };
let initialized = false;

const bufferCache = new Map<string, AudioBuffer>();
let currentMusicSource: AudioBufferSourceNode | null = null;
let currentMusicGainNode: GainNode | null = null;
let currentMusicPath: string | null = null;
let currentMusicSlot: MusicSlot | null = null;

export function initAudio(): boolean {
  if (initialized) return true;
  if (globalThis.AudioContext === undefined) return false;

  ctx = new AudioContext();
  masterGain = ctx.createGain();
  musicGain = ctx.createGain();
  sfxGain = ctx.createGain();

  musicGain.connect(masterGain);
  sfxGain.connect(masterGain);
  masterGain.connect(ctx.destination);

  settings = loadAudioSettings();
  applyGains();
  initialized = true;
  return ctx.state === AudioContextStateValue.Running;
}

export function destroyAudio(): void {
  stopMusic();
  if (ctx && ctx.state !== AudioContextStateValue.Closed) {
    ctx.close().catch(() => {});
  }
  ctx = null;
  masterGain = null;
  musicGain = null;
  sfxGain = null;
  bufferCache.clear();
  initialized = false;
}

function toGain(value: number): number {
  return (Math.min(Math.max(value, VOLUME_MIN), VOLUME_MAX) / VOLUME_MAX) ** 2;
}

function applyGains(): void {
  if (!masterGain || !musicGain || !sfxGain) return;
  const t = ctx?.currentTime ?? 0;
  masterGain.gain.setValueAtTime(
    settings.muted ? 0 : toGain(settings.masterVolume),
    t,
  );
  musicGain.gain.setValueAtTime(toGain(settings.musicVolume), t);
  sfxGain.gain.setValueAtTime(toGain(settings.sfxVolume), t);
}

export function updateSettings(next: AudioSettings): void {
  settings = { ...next };
  saveAudioSettings(settings);
  applyGains();
}

export function getSettings(): AudioSettings {
  return { ...settings };
}

async function loadBuffer(path: string): Promise<AudioBuffer | null> {
  if (!ctx) return null;

  const cached = bufferCache.get(path);
  if (cached) return cached;

  try {
    const res = await fetch(encodeURI(path));
    if (!res.ok) return null;
    const arrayBuf = await res.arrayBuffer();
    const decoded = await ctx.decodeAudioData(arrayBuf);
    bufferCache.set(path, decoded);
    return decoded;
  } catch {
    return null;
  }
}

export function playSfx(id: SfxId): void {
  if (!ctx || !sfxGain || !initialized) return;
  if (settings.muted) return;

  const pool = SFX_MANIFEST[id];
  if (!pool || pool.length === 0) return;

  const path = pickRandom(pool);

  void loadBuffer(path).then((buffer) => {
    if (!buffer || !ctx || !sfxGain) return;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(sfxGain);
    source.start();
  });
}

function stopMusic(): void {
  if (currentMusicSource) {
    try {
      currentMusicSource.stop();
    } catch {}
    currentMusicSource.disconnect();
    currentMusicSource = null;
  }
  if (currentMusicGainNode) {
    currentMusicGainNode.disconnect();
    currentMusicGainNode = null;
  }
  currentMusicPath = null;
  currentMusicSlot = null;
}

const SLOT_OFFSET: Partial<Record<MusicSlot, number>> = {
  [MusicSlotValue.Title]: 5,
};

export function playMusic(slot: MusicSlot): void {
  if (!ctx || !musicGain || !initialized) return;

  if (slot === currentMusicSlot && currentMusicSource) return;

  const pool = MUSIC_MANIFEST[slot];
  if (!pool || pool.length === 0) return;

  const path = pickRandom(pool);
  crossfadeTo(path, slot, SLOT_OFFSET[slot] ?? 0);
}

function crossfadeTo(path: string, slot: MusicSlot, offset = 0): void {
  if (!ctx || !musicGain) return;

  const fadeSeconds = CROSSFADE_MS / MILLISECONDS_PER_SECOND;
  const now = ctx.currentTime;

  if (currentMusicGainNode && currentMusicSource) {
    const oldGain = currentMusicGainNode;
    const oldSource = currentMusicSource;
    oldGain.gain.setValueAtTime(oldGain.gain.value, now);
    oldGain.gain.linearRampToValueAtTime(0, now + fadeSeconds);
    setTimeout(() => {
      try {
        oldSource.stop();
      } catch {}
      oldSource.disconnect();
      oldGain.disconnect();
    }, CROSSFADE_MS + SOURCE_CLEANUP_GRACE_MS);
  }

  currentMusicSource = null;
  currentMusicGainNode = null;
  currentMusicPath = path;
  currentMusicSlot = slot;

  void loadBuffer(path).then((buffer) => {
    if (!buffer || !ctx || !musicGain) return;
    if (currentMusicPath !== path) return;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, ctx.currentTime + fadeSeconds);
    gainNode.connect(musicGain);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = false;
    source.connect(gainNode);
    source.start(0, offset);

    source.onended = () => {
      if (currentMusicPath === path && currentMusicSlot === slot) {
        const nextPath = pickRandom(MUSIC_MANIFEST[slot]);
        crossfadeTo(nextPath, slot);
      }
    };

    currentMusicSource = source;
    currentMusicGainNode = gainNode;
  });
}

export function stopMusicPlayback(): void {
  stopMusic();
}

export function pauseAudio(): void {
  if (!ctx || !musicGain) return;
  const t = ctx.currentTime;
  musicGain.gain.setValueAtTime(musicGain.gain.value, t);
  musicGain.gain.linearRampToValueAtTime(0, t + 0.2);
}

export function resumeAudio(): void {
  if (!ctx || !musicGain) return;
  if (ctx.state === AudioContextStateValue.Suspended) {
    ctx.resume().catch(() => {});
    applyGains();
  }
  const t = ctx.currentTime;
  const target = toGain(settings.musicVolume);
  musicGain.gain.setValueAtTime(musicGain.gain.value, t);
  musicGain.gain.linearRampToValueAtTime(target, t + 0.2);
}

export function getCurrentTrackName(): string | null {
  if (!currentMusicPath) return null;
  return resolveTrackName(currentMusicPath);
}
