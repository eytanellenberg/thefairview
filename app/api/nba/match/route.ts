import { NextResponse } from "next/server"
import { nbaRecentMatches } from "@/app/lib/Demo/nba"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const matchId = searchParams.get("matchId")
  const match = nbaRecentMatches.find(m => m.matchId === matchId)

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 })
  }

  return NextResponse.json({ match })
}
