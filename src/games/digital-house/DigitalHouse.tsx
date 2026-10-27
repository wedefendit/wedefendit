import { useEffect, useRef } from "react";
import { Flame, Sparkles } from "lucide-react";
import { DifficultyValue } from "../shared/types";
import { useDigitalHouseController } from "./DigitalHouse.controller";
import { ToastTypeValue } from "./model";
import {
  MobileScaledHouseFrame,
  ScaledHouseFrame,
} from "./ui/DigitalHouseBoard";
import { DigitalHouseHeader } from "./ui/DigitalHouseHeader";
import { CoachMark } from "./ui/CoachMark";
import { IdleHintBanner } from "./ui/IdleHint";
import { HelpModal } from "./ui/HelpModal";
import {
  AfterActionReportButton,
  DeviceStrip,
  DigitalHouseInventoryPanel,
} from "./ui/DigitalHouseInventory";
import { EndSummaryModal } from "./ui/EndSummaryModal";
import { GameToast } from "./ui/GameToast";
import {
  DigitalHouseAnalysisCard,
  DigitalHouseScoreHud,
} from "./ui/DigitalHouseStatusStrip";

const DIGITAL_HOUSE_TEST_ID = {
  main: "dh-main",
  housePanel: "dh-house-panel",
};
const FULL_WIDTH_ROW_CLASS = "w-full shrink-0";
const MOBILE_HOUSE_PANEL_CLASS =
  "relative min-h-0 w-full flex-1 overflow-visible";
const TOAST_ICON_SIZE = 14;
const MOBILE_TOAST_BOTTOM_OFFSET = 60;
const DESKTOP_TOAST_BOTTOM_OFFSET = 12;

export function DigitalHouse() {
  const {
    activeToast, allowDrag, badgeJustEarned, closeSummary, coachStepsConfig,
    deviceTone, difficulty, dismissHelp, dismissIdleHint, dismissOnboarding,
    guidedDeviceCards, handleSelect, handleTryAgain, helpOpen, houseProps,
    idleHint, inventoryColumns, isComplete, lastPlacement, mobile, onTryHarder,
    openHelp, openSummary, placedIds, placedZones, placements, railRef, result,
    returnDevice, riskCount, scoreDelta, selectedDevice, selectedId, showEnd,
    showOnboarding, tablet, totalDevices, zoneBlockedFeedback,
  } = useDigitalHouseController();
  const inventoryScrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (isComplete && inventoryScrollRef.current) {
      inventoryScrollRef.current.scrollTo({
        top: inventoryScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [isComplete]);

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
    <DigitalHouseAnalysisCard
      lastPlacement={lastPlacement}
      selectedDevice={selectedDevice}
      result={result}
      desktop={!mobile}
    />
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
  const idleHintOverlay = idleHint && !showOnboarding && (
    <div className="pointer-events-none absolute inset-x-2 bottom-2 z-20 flex justify-center">
      <IdleHintBanner hint={idleHint} onDismiss={dismissIdleHint} />
    </div>
  );
  const halfwayToast = activeToast?.type === ToastTypeValue.Halfway;

  return (
    <div
      data-testid="dh-root"
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden text-slate-950 dark:text-slate-50"
    >
      <style>
        {[
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
        ].join(" ")}
      </style>

      <DigitalHouseHeader onOpenHelp={openHelp} />

      {mobile && (
        <main
          data-testid={DIGITAL_HOUSE_TEST_ID.main}
          className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden px-2 py-1"
        >
          <div className={FULL_WIDTH_ROW_CLASS}>{scoreHud}</div>

          <div className={FULL_WIDTH_ROW_CLASS}>{analysisCard}</div>

          <section
            data-testid={DIGITAL_HOUSE_TEST_ID.housePanel}
            className={MOBILE_HOUSE_PANEL_CLASS}
          >
            <MobileScaledHouseFrame {...houseProps} />

            {idleHintOverlay}

            {zoneBlockedFeedback && (
              <div
                key={zoneBlockedFeedback.key}
                style={{ animation: "dh-slideIn 0.3s ease" }}
                className="absolute inset-x-2 bottom-2 z-20 flex justify-center"
              >
                <div className="rounded-xl border border-amber-400/50 bg-amber-50/95 px-3 py-1.5 text-[12px] font-medium text-amber-800 shadow-lg dark:border-amber-400/30 dark:bg-amber-950/90 dark:text-amber-200">
                  Assign this room&apos;s network zone before placing a device.
                </div>
              </div>
            )}
          </section>

          <div className="w-full shrink-0 pt-1">
            <DeviceStrip
              selectedId={selectedId}
              placedIds={placedIds}
              placedZones={placedZones}
              onSelect={handleSelect}
              onReturn={returnDevice}
              allowDrag={allowDrag}
              guided={guidedDeviceCards}
              deviceTone={deviceTone}
              onTouchDragStart={houseProps.onTouchDragStart}
            />
          </div>
          {isComplete && (
            <div className="w-full shrink-0 px-1 pt-1">
              <AfterActionReportButton
                score={result.total}
                riskCount={riskCount}
                onOpen={openSummary}
              />
            </div>
          )}
        </main>
      )}
      {!mobile && tablet && (
        <main
          data-testid={DIGITAL_HOUSE_TEST_ID.main}
          className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden px-4 py-2"
        >
          <div className="mx-auto flex min-h-0 w-full max-w-[860px] flex-1 flex-col gap-1 overflow-hidden">
            <div className={FULL_WIDTH_ROW_CLASS}>{scoreHud}</div>

            <div className={FULL_WIDTH_ROW_CLASS}>{analysisCard}</div>

            <section
              data-testid={DIGITAL_HOUSE_TEST_ID.housePanel}
              className={MOBILE_HOUSE_PANEL_CLASS}
            >
              <MobileScaledHouseFrame {...houseProps} />

              {idleHintOverlay}
            </section>

            <div className="w-full min-h-0 overflow-y-auto max-h-[150px]">
              {inventoryCard}
            </div>
          </div>
        </main>
      )}
      {!mobile && !tablet && (
        <main
          data-testid={DIGITAL_HOUSE_TEST_ID.main}
          className="dh-game-main relative flex min-h-0 w-full flex-1 items-start justify-center overflow-hidden px-4 py-3 xl:px-6 xl:py-4"
        >
          <div className="my-auto flex min-h-0 max-h-full w-full max-w-[1800px] items-start gap-4 xl:gap-5">
            <section
              data-testid={DIGITAL_HOUSE_TEST_ID.housePanel}
              className="dh-house-panel relative flex min-h-0 flex-1 items-center justify-center self-stretch overflow-visible p-2 xl:p-3"
            >
              <ScaledHouseFrame {...houseProps} />

              {idleHintOverlay}
            </section>

            <aside
              data-testid="dh-rail"
              ref={railRef}
              className="dh-sidebar-panel relative flex min-h-0 w-[380px] shrink-0 flex-col gap-3 self-stretch overflow-hidden p-1 xl:w-[440px] xl:gap-4 xl:p-2 2xl:w-[500px]"
            >
              {scoreHud}
              {analysisCard}
              <div
                ref={inventoryScrollRef}
                className="min-h-0 flex-1 overflow-y-auto"
              >
                {inventoryCard}
              </div>
            </aside>
          </div>
        </main>
      )}

      {activeToast && (
        <GameToast
          key={activeToast.key}
          icon={
            halfwayToast ? (
              <Sparkles size={TOAST_ICON_SIZE} />
            ) : (
              <Flame size={TOAST_ICON_SIZE} />
            )
          }
          label={activeToast.label}
          hint={activeToast.hint}
          accent={halfwayToast ? "sky" : "amber"}
          mobile={mobile}
          bottomOffset={
            mobile ? MOBILE_TOAST_BOTTOM_OFFSET : DESKTOP_TOAST_BOTTOM_OFFSET
          }
        />
      )}

      {showOnboarding && (
        <CoachMark steps={coachStepsConfig} onDismiss={dismissOnboarding} />
      )}

      {helpOpen && <HelpModal onDismiss={dismissHelp} />}

      {showEnd && (
        <EndSummaryModal
          result={result}
          placements={placements}
          badge={badgeJustEarned}
          canTryHarder={difficulty !== DifficultyValue.Hard}
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
