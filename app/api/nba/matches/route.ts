import { NextResponse } from "next/server"
import { nbaRecentMatches } from "@/app/lib/Demo/nba"

export async function GET() {
  return NextResponse.json({ matches: nbaRecentMatches })
}
