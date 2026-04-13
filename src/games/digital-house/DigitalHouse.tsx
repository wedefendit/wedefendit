/*
Copyright © 2025 Defend I.T. Solutions LLC. All Rights Reserved.

This software and its source code are the proprietary property of
Defend I.T. Solutions LLC and are protected by United States and
international copyright laws. Unauthorized reproduction, distribution,
modification, display, or use of this software, in whole or in part, without the
prior written permission of Defend I.T. Solutions LLC, is strictly prohibited.

This software is provided for use only by authorized employees, contractors, or
licensees of Defend I.T. Solutions LLC and may not be disclosed to any third
party without express written consent.
*/

import { Flame, Sparkles } from "lucide-react";
import { useDigitalHouseController } from "./DigitalHouse.controller";
import { PhoneScaledHouseFrame, ScaledHouseFrame } from "./ui/DigitalHouseBoard";
import { DigitalHouseHeader } from "./ui/DigitalHouseHeader";
import { HelpModal } from "./ui/HelpModal";
import { AfterActionReportButton, DeviceTrayGrid, DigitalHouseInventoryPanel } from "./ui/DigitalHouseInventory";
import { EndSummaryModal } from "./ui/EndSummaryModal";
import { GameToast } from "./ui/GameToast";
import { DigitalHouseAnalysisCard, DigitalHouseScoreHud } from "./ui/DigitalHouseStatusStrip";

export function DigitalHouse() {
  const {
    viewport,
    mobile,
    compactDesktop,
    result,
    placements,
    placedIds,
    totalDevices,
    houseProps,
    helpOpen,
    dismissHelp,
    showEnd,
    badgeJustEarned,
    difficulty,
    handleTryAgain,
    onTryHarder,
    closeSummary,
    activeToast,
    scoreDelta,
    selectedId,
    placedZones,
    handleSelect,
    returnDevice,
    allowDrag,
    guidedDeviceCards,
    deviceTone,
    inventoryColumns,
    trayRef,
    railRef,
    trayHeight,
    toolbarOffset,
    openHelp,
    openSummary,
    isComplete,
    riskCount,
    lastPlacement,
  } = useDigitalHouseController();

  const scoreHud = (
    <DigitalHouseScoreHud
      result={result}
      placedCount={placedIds.size}
      totalDevices={totalDevices}
      mobile={mobile}
      difficulty={difficulty}
      scoreDelta={scoreDelta}
    />
  );

  const analysisCard = (
    <DigitalHouseAnalysisCard lastPlacement={lastPlacement} result={result} compact />
  );

  const inventoryCard = (
    <DigitalHouseInventoryPanel
      selectedId={selectedId}
      placedIds={placedIds}
      placedZones={placedZones}
      onSelect={handleSelect}
      onReturn={returnDevice}
      allowDrag={allowDrag}
      guided={guidedDeviceCards}
      deviceTone={deviceTone}
      columns={inventoryColumns}
      onTouchDragStart={houseProps.onTouchDragStart}
      showAfterAction={isComplete}
      score={result.total}
      riskCount={riskCount}
      onOpenAfterAction={openSummary}
    />
  );

  return (
    <div
      data-testid="dh-root"
      className="relative isolate flex min-h-0 flex-1 flex-col overflow-hidden text-slate-950 dark:text-slate-50"
    >      <style>{[
        "@keyframes dh-popIn { 0% { transform: scale(0); opacity: 0 } 60% { transform: scale(1.2) } 100% { transform: scale(1); opacity: 1 } }",
        "@keyframes dh-dangerPulse { 0%, 100% { border-color: rgba(220,38,38,0.3) } 50% { border-color: rgba(220,38,38,1) } }",
        "@keyframes dh-slideIn { from { transform: translateY(16px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }",
        "@keyframes dh-fadeIn { from { opacity: 0 } to { opacity: 1 } }",
        "@keyframes dh-staggerIn { from { transform: translateY(10px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }",
        "@keyframes dh-borderPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(56,189,248,0) } 50% { box-shadow: 0 0 0 4px rgba(56,189,248,0.18) } }",
        "@keyframes dh-floatUp { 0% { transform: translateY(6px); opacity: 0 } 20% { opacity: 1 } 100% { transform: translateY(-26px); opacity: 0 } }",
        "@keyframes dh-toastIn { 0% { transform: translate(-50%, 24px); opacity: 0 } 10% { opacity: 1 } 90% { opacity: 1 } 100% { transform: translate(-50%, -6px); opacity: 0 } }",
        "@keyframes dh-hintPulse { 0%, 100% { opacity: 0.65; transform: translateY(0) } 50% { opacity: 1; transform: translateY(-3px) } }",
        "@keyframes dh-modalRise { 0% { transform: translateY(40px) scale(0.94); opacity: 0 } 60% { transform: translateY(-4px) scale(1.02); opacity: 1 } 100% { transform: translateY(0) scale(1); opacity: 1 } }",
        "@keyframes dh-comboPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.0), 0 0 0 0 rgba(56,189,248,0) } 50% { box-shadow: 0 0 0 2px rgba(239,68,68,0.4), 0 0 24px rgba(239,68,68,0.15) } }",
      ].join(" ")}</style>

      <DigitalHouseHeader onOpenHelp={openHelp} />

      {mobile ? (
        <main
          data-testid="dh-main"
          className="dh-game-main relative flex w-full flex-1 flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            paddingBottom: "calc(" + toolbarOffset + "px + env(safe-area-inset-bottom) + 16px)",
          }}
        >
          <div className="m-auto flex w-full flex-col gap-2 px-3 py-2">
            {scoreHud}

            <section
              data-testid="dh-house-panel"
              className="dh-house-panel relative w-full overflow-visible"
            >
              <PhoneScaledHouseFrame {...houseProps} bottomOffset={toolbarOffset} />
            </section>

            <aside data-testid="dh-rail" className="dh-sidebar-panel relative w-full">
              {analysisCard}
              {isComplete && (
                <div className="mt-2">
                  <AfterActionReportButton
                    score={result.total}
                    riskCount={riskCount}
                    onOpen={openSummary}
                  />
                </div>
              )}
            </aside>
          </div>
        </main>
      ) : (
        <main
          data-testid="dh-main"
          className="dh-game-main relative flex min-h-0 w-full flex-1 items-start justify-center overflow-hidden px-4 py-3 xl:px-6 xl:py-4"
        >
          <div data-testid="dh-status-strip" className="contents" />
          <div className="flex min-h-0 w-full max-w-[1200px] items-start gap-4 xl:gap-5" style={{ maxHeight: "100%" }}>
            <section
              data-testid="dh-house-panel"
              className="dh-house-panel relative flex min-h-0 flex-[1.4_1_0] items-center justify-center self-stretch overflow-visible p-2 xl:p-3"
            >
              <ScaledHouseFrame {...houseProps} />
            </section>

            <aside
              data-testid="dh-rail"
              ref={railRef}
              className="dh-sidebar-panel relative flex min-h-0 flex-[1_1_0] flex-col gap-3 self-stretch overflow-hidden p-1 xl:gap-4 xl:p-2"
              style={{
                minWidth: compactDesktop ? 310 : 340,
                maxWidth: viewport.band === "ultra" ? 440 : 400,
              }}
            >
              {scoreHud}
              {analysisCard}
              <div className="min-h-0 flex-1 overflow-y-auto">
                {inventoryCard}
              </div>
            </aside>
          </div>
        </main>
      )}

      {mobile && (
        <div
          data-testid="dh-mobile-tray"
          ref={trayRef}
          className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/95 px-2 pt-2 shadow-[0_-8px_24px_rgba(15,23,42,0.14)] backdrop-blur-md dark:border-sky-400/15 dark:bg-slate-950/95 dark:shadow-[0_-8px_24px_rgba(2,6,23,0.55)]"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
        >
          <DeviceTrayGrid
            selectedId={selectedId}
            placedIds={placedIds}
            placedZones={placedZones}
            onSelect={handleSelect}
            onReturn={returnDevice}
            layout="toolbar"
            allowDrag={allowDrag}
            guided={guidedDeviceCards}
            deviceTone={deviceTone}
            onTouchDragStart={houseProps.onTouchDragStart}
          />
        </div>
      )}

      {activeToast && (
        <GameToast
          key={activeToast.key}
          icon={
            activeToast.type === "halfway" ? (
              <Sparkles size={14} />
            ) : (
              <Flame size={14} />
            )
          }
          label={activeToast.label}
          hint={activeToast.hint}
          accent={activeToast.type === "halfway" ? "sky" : "amber"}
          mobile={mobile}
          bottomOffset={toolbarOffset + 12}
        />
      )}

      {helpOpen && <HelpModal onDismiss={dismissHelp} />}

      {showEnd && (
        <EndSummaryModal
          result={result}
          placements={placements}
          badge={badgeJustEarned}
          canTryHarder={difficulty !== "hard"}
          currentDifficulty={difficulty}
          mobile={mobile}
          onTryAgain={handleTryAgain}
          onTryHarder={onTryHarder}
          onDismiss={closeSummary}
        />
      )}
    </div>
  );
}
