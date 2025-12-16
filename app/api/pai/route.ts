import { NextResponse } from "next/server";
import { getLastAndNextGame } from "@/lib/providers/espn";
import { calculatePAI } from "@/lib/pai/calculatePAI";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sport = searchParams.get("sport") as "nba" | "nfl" | "mlb";
  const teamId = searchParams.get("teamId");

  if (!sport || !teamId) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const { last } = await getLastAndNextGame(sport, teamId);

  if (!last || last.status !== "final") {
    return NextResponse.json({ status: "no_last_game" }, { status: 200 });
  }

  const isHome = last.home.id === teamId;
  const scored = isHome ? last.home.score! : last.away.score!;
  const conceded = isHome ? last.away.score! : last.home.score!;

  const paiResult = calculatePAI({
    side: isHome ? "home" : "away",
    scored,
    conceded
  });

  return NextResponse.json({
    status: "free",
    sport,
    teamId,
    game: last,
    pai: paiResult.pai,
    margin: paiResult.margin,
    factors: paiResult.factors
  });
}
