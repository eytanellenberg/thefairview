import { NextResponse } from "next/server";
import { getLastAndNextGame } from "@/lib/providers/espn";
import { calculateRAI } from "@/lib/rai/calculateRAI";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sport = searchParams.get("sport") as "nba" | "nfl" | "mlb";
  const teamId = searchParams.get("teamId");

  if (!sport || !teamId) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const { next } = await getLastAndNextGame(sport, teamId);

  if (!next) {
    return NextResponse.json({ status: "no_next_game" }, { status: 200 });
  }

  const isHome = next.home.id === teamId;

  // Free mode: no historical rest → assume neutral (1 day)
  const daysRest = 1;

  const raiResult = calculateRAI({
    side: isHome ? "home" : "away",
    daysRest,
    seasonStarted: false
  });

  return NextResponse.json({
    status: "free",
    sport,
    teamId,
    game: next,
    rai: raiResult.rai,
    factors: raiResult.factors
  });
}
