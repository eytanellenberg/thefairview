import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const gameId = searchParams.get("gameId") ?? "demo-game";
  const teamId = searchParams.get("teamId") ?? "demo-team";

  return NextResponse.json(
    {
      status: "demo",
      meta: {
        engine: "FAIR",
        mode: "demo",
        calibration: "in-progress"
      },
      request: {
        gameId,
        teamId
      },
      rai: {
        status: "disabled",
        message: "RAI disabled in demo mode"
      },
      pai: {
        value: 0.62,
        interpretation: "Moderate post-game performance attribution",
        components: [
          { factor: "Offensive efficiency", contribution: 0.28 },
          { factor: "Defensive pressure", contribution: 0.21 },
          { factor: "Pace & tempo", contribution: 0.13 }
        ]
      }
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  return GET(request);
}
