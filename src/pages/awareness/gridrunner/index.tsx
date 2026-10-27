import { Meta } from "@/components";
import { GameShell } from "@/games/shared/GameShell";
import { GridRunner } from "@/games/gridrunner";
import { SITE_URL } from "@/lib/og";

export default function GridRunnerPage() {
  const canonical = `${SITE_URL}/awareness/gridrunner`;

  return (
    <>
      <Meta
        title="GRIDRUNNER: Cybersecurity RPG | Defend I.T. Solutions"
        description="Play a free cybersecurity RPG. Battle threats based on real cases, collect cybersecurity tools, and defend the grid in your browser."
        url={canonical}
        canonical={canonical}
      />
      <GameShell gameId="gridrunner" title="GRIDRUNNER" chrome="headless">
        <GridRunner />
      </GameShell>
    </>
  );
}
