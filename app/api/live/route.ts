import { NextResponse } from "next/server";
import { getLastAndNextGame } from "@/lib/providers/espn";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sport = searchParams.get("sport") as "nba" | "nfl" | "mlb";
  const teamId = searchParams.get("teamId");

  if (!sport || !teamId) {
    return NextResponse.json({ error: "Missing sport or teamId" }, { status: 400 });
  }

  const { last, next } = await getLastAndNextGame(sport, teamId);

  return NextResponse.json({
    status: "free",
    sport,
    teamId,
    lastGame: last ?? null,
    nextGame: next ?? null
  });
}
