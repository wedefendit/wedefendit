"use client";

import { GridRunnerShell } from "./GridRunnerShell";
import { useCallback, useEffect, useRef } from "react";
import { useForceDarkMode } from "./hooks/useForceDarkMode";
import { useGridRunner } from "./hooks/useGridRunner";
import { useAudio } from "./hooks/useAudio";
import { GAME_LIMITS, OverlayValue } from "./engine/game-state";
import {
  GameScreenValue,
  OnboardingKeyValue,
  ToolTypeValue,
  type OnboardingKey,
  type ToolInstance,
  type ToolType,
} from "./engine/types";
import { SfxIdValue, type SfxId } from "./engine/audio";
import { BootScreen } from "./ui/screens/BootScreen";
import { TitleScreen } from "./ui/screens/TitleScreen";
import { OverworldScreen } from "./ui/screens/OverworldScreen";
import { BattleScreen } from "./ui/screens/BattleScreen";
import { PlayerHUD } from "./ui/hud/PlayerHUD";
import { MenuOverlay } from "./ui/screens/MenuOverlay";
import { DiscScreen } from "./ui/screens/DiscScreen";
import { InventoryScreen } from "./ui/screens/InventoryScreen";
import { OperatorScreen } from "./ui/screens/OperatorScreen";
import { SaveScreen } from "./ui/screens/SaveScreen";
import { SettingsScreen } from "./ui/screens/SettingsScreen";
import { ShopScreen } from "./ui/screens/ShopScreen";
import { LevelUpOverlay } from "./ui/screens/LevelUpOverlay";
import { IntelReportScreen } from "./ui/screens/IntelReportScreen";
import { SectorUnlockOverlay } from "./ui/screens/SectorUnlockOverlay";
import { TutorialPrompt } from "./ui/screens/TutorialPrompt";
import { BattleTransition } from "./ui/shared/BattleTransition";

enum ActionButtonValue {
  Primary = "a",
  Secondary = "b",
}

const ONBOARDING_COPY: Record<OnboardingKey, string> = {
  [OnboardingKeyValue.Loot]:
    "You found a tool. Open Inventory or press I to equip it. Its stats determine damage, accuracy, and energy use.",
  [OnboardingKeyValue.Shop]:
    "Use the shop to spend Bits on tools. More tools unlock as you level up.",
  [OnboardingKeyValue.Disc]:
    "Identity Disc updated. Open it from the menu or press Shift+D to review tools and intel.",
  [OnboardingKeyValue.Boss]:
    "Boss ahead. Equip your tools and restore your HP before moving forward.",
};
import { zoneNames } from "./data/sectors";

const TOOL_SFX: Record<ToolType, SfxId> = {
  [ToolTypeValue.Recon]: SfxIdValue.ToolRecon,
  [ToolTypeValue.Exploit]: SfxIdValue.ToolExploit,
  [ToolTypeValue.Defense]: SfxIdValue.ToolDefense,
  [ToolTypeValue.Persistence]: SfxIdValue.ToolPersistence,
};

export function GridRunner() {
  useForceDarkMode();
  const game = useGridRunner();

  const isBootScreen = game.screen === GameScreenValue.Boot;
  const isTitleScreen = game.screen === GameScreenValue.Title;
  const isBattle = game.screen === GameScreenValue.Battle;
  const isMapScreen =
    game.screen === GameScreenValue.Overworld ||
    game.screen === GameScreenValue.Building;
  const zoneName =
    zoneNames[game.currentZone] ?? game.currentZone.toUpperCase();

  const isBoss = game.battle?.isBoss ?? false;
  const isPaused = game.overlay !== OverlayValue.None;
  const audio = useAudio(
    isBootScreen ? GameScreenValue.Title : game.screen,
    game.currentZone,
    isBoss,
    isPaused,
  );

  const prevPosRef = useRef(game.playerPos);
  useEffect(() => {
    const prev = prevPosRef.current;
    if (
      isMapScreen &&
      (prev.x !== game.playerPos.x || prev.y !== game.playerPos.y)
    ) {
      audio.sfx(SfxIdValue.Step);
    }
    prevPosRef.current = game.playerPos;
  }, [game.playerPos, isMapScreen, audio]);

  const prevScreenRef = useRef(game.screen);
  useEffect(() => {
    if (
      prevScreenRef.current !== GameScreenValue.Battle &&
      game.screen === GameScreenValue.Battle
    ) {
      audio.sfx(SfxIdValue.Encounter);
    }
    prevScreenRef.current = game.screen;
  }, [game.screen, audio]);

  const prevOverlayRef = useRef(game.overlay);
  useEffect(() => {
    const prev = prevOverlayRef.current;
    if (prev === OverlayValue.None && game.overlay !== OverlayValue.None) {
      audio.sfx(SfxIdValue.MenuOpen);
    } else if (
      prev !== OverlayValue.None &&
      game.overlay === OverlayValue.None
    ) {
      audio.sfx(SfxIdValue.MenuClose);
    }
    prevOverlayRef.current = game.overlay;
  }, [game.overlay, audio]);

  const prevLogLenRef = useRef(0);
  useEffect(() => {
    if (!game.battle) {
      prevLogLenRef.current = 0;
      return;
    }
    const log = game.battle.log;
    if (log.length <= prevLogLenRef.current) return;

    for (let i = prevLogLenRef.current; i < log.length; i++) {
      const entry = log[i];
      if (entry.includes("[CRIT]")) {
        audio.sfx(SfxIdValue.Critical);
      } else if (entry.includes("[HIT]")) {
        audio.sfx(SfxIdValue.Hit);
      } else if (entry.includes("[MISS]")) {
        audio.sfx(SfxIdValue.Miss);
      }
    }
    prevLogLenRef.current = log.length;
  }, [game.battle?.log.length, game.battle, audio]);

  const handleUseTool = useCallback(
    (tool: ToolInstance) => {
      audio.sfx(TOOL_SFX[tool.type]);
      game.handleUseTool(tool);
    },
    [audio, game],
  );

  const handleMuteToggle = useCallback(() => {
    audio.onSettingsChange({ ...audio.settings, muted: !audio.settings.muted });
  }, [audio]);

  const handlePlayChime = useCallback(() => {
    audio.sfx(SfxIdValue.LevelUp);
  }, [audio]);

  return (
    <GridRunnerShell
      hideControls={isBootScreen || isTitleScreen}
      onDPadPress={game.handleDPadPress}
      onDPadRelease={game.handleDPadRelease}
      onActionPress={(btn) => {
        if (btn === ActionButtonValue.Primary) game.handleInteract();
        if (btn === ActionButtonValue.Secondary) game.handleCloseOverlay();
      }}
      onSelect={game.handleOpenDisc}
      onStart={game.handleOpenMenu}
    >
      {isBootScreen && (
        <BootScreen
          saveSummary={game.saveSummary}
          onBootDone={game.handleBootDone}
          onDeleteSave={game.handleDeleteSave}
          onPlayChime={handlePlayChime}
        />
      )}
      {isTitleScreen && (
        <TitleScreen
          hasSave={game.hasSaveFile}
          onNewGame={game.startGame}
          onContinue={game.continueGame}
          muted={audio.settings.muted}
          onMuteToggle={handleMuteToggle}
        />
      )}
      {isMapScreen && game.save && (
        <>
          <PlayerHUD
            player={game.save.player}
            playerName={game.save.playerName}
            bits={game.save.bits}
            trackName={audio.trackName}
          />
          <OverworldScreen
            map={game.map}
            playerPos={game.playerPos}
            facing={game.facing}
            zoneName={zoneName}
            gateUnlocked={
              game.save?.defeatedBosses.includes("trader-traitor") ?? false
            }
          />
        </>
      )}
      {isBattle && game.battle && game.save && (
        <BattleScreen
          battle={game.battle}
          player={game.save.player}
          playerName={game.save.playerName}
          equippedTools={game.save.equippedTools}
          onUseTool={handleUseTool}
          onRun={game.handleRun}
          onBattleEnd={game.handleBattleEnd}
          tutorialStep={game.tutorialStep}
          onAdvanceTutorial={game.handleAdvanceTutorial}
        />
      )}

      {game.overlay === OverlayValue.Menu && (
        <MenuOverlay
          onClose={game.handleCloseOverlay}
          onOpenOverlay={game.handleOpenOverlay}
          inBattle={isBattle}
        />
      )}
      {game.overlay === OverlayValue.Disc && game.save && (
        <DiscScreen
          onClose={game.handleCloseOverlay}
          equippedTools={game.save.equippedTools}
          inventory={game.save.inventory}
        />
      )}
      {game.overlay === OverlayValue.Inventory && game.save && (
        <InventoryScreen
          onClose={game.handleCloseOverlay}
          equippedTools={game.save.equippedTools}
          inventory={game.save.inventory}
          onEquip={game.handleEquipTool}
          onScrap={game.handleScrapTool}
        />
      )}
      {game.overlay === OverlayValue.Operator && game.save && (
        <OperatorScreen
          onClose={game.handleCloseOverlay}
          player={game.save.player}
          playerName={game.save.playerName}
          bits={game.save.bits}
          defeatedBosses={game.save.defeatedBosses}
          playTime={game.save.playTime}
        />
      )}
      {game.overlay === OverlayValue.Save && (
        <SaveScreen
          onClose={game.handleCloseOverlay}
          onSave={game.handleManualSave}
        />
      )}
      {game.overlay === OverlayValue.Settings && (
        <SettingsScreen
          onClose={game.handleCloseOverlay}
          audioSettings={audio.settings}
          onAudioChange={audio.onSettingsChange}
        />
      )}
      {game.overlay === OverlayValue.Shop && game.save && (
        <ShopScreen
          onClose={game.handleCloseOverlay}
          player={game.save.player}
          bits={game.save.bits}
          inventoryFull={game.save.inventory.length >= GAME_LIMITS.inventoryItems}
          onBuy={game.handleBuyTool}
        />
      )}
      {game.overlay === OverlayValue.LevelUp && game.levelUpSummary && (
        <LevelUpOverlay
          oldLevel={game.levelUpSummary.oldLevel}
          newLevel={game.levelUpSummary.newLevel}
          statDeltas={game.levelUpSummary.statDeltas}
          onContinue={game.handleDismissLevelUp}
        />
      )}
      {game.overlay === OverlayValue.Intel && game.pendingIntelBossId && (
        <IntelReportScreen
          bossId={game.pendingIntelBossId}
          onClose={game.handleDismissIntel}
        />
      )}
      {game.overlay === OverlayValue.SectorUnlock && (
        <SectorUnlockOverlay onClose={game.handleDismissSectorUnlock} />
      )}
      {game.battleTransition && (
        <BattleTransition
          phase={game.battleTransition}
          onEnd={game.handleBattleTransitionEnd}
        />
      )}
      {game.activeOnboarding &&
        game.overlay !== OverlayValue.LevelUp &&
        game.overlay !== OverlayValue.Intel && (
          <div className="absolute inset-x-0 bottom-0 z-50 p-2">
            <TutorialPrompt
              message={ONBOARDING_COPY[game.activeOnboarding]}
              onDismiss={() =>
                game.handleDismissOnboarding(game.activeOnboarding)
              }
            />
          </div>
        )}
    </GridRunnerShell>
  );
}
