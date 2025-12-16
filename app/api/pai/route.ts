import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { computeTeamPAI } from "@/lib/domain/nbaAnalysis";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get("sport");
  const teamId = searchParams.get("teamId");

  if (!sport || !teamId) {
    return NextResponse.json({ error: "Missing sport or teamId" }, { status: 400 });
  }

  if (sport !== "nba") {
    return NextResponse.json({ error: "Only nba supported for now" }, { status: 400 });
  }

  const out = await computeTeamPAI("nba", teamId);

  return NextResponse.json({
    status: "free",
    type: "post-game",
    ...out
  });
}
