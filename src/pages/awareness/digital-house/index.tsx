import { Meta } from "@/components";
import { GameShell } from "@/games/shared/GameShell";
import { DigitalHouse } from "@/games/digital-house/DigitalHouse";
import { SITE_URL } from "@/lib/og";

export default function DigitalHousePage() {
  const canonical = `${SITE_URL}/awareness/digital-house`;

  return (
    <>
      <Meta
        title="The Digital House: Home Network Security Game | Defend I.T. Solutions"
        description="Build a safer home network and learn how network zones can limit unnecessary access between personal, guest, and smart devices."
        url={canonical}
        canonical={canonical}
      />
      <GameShell
        gameId="digital-house"
        title="The Digital House"
        chrome="headless"
      >
        <DigitalHouse />
      </GameShell>
    </>
  );
}
