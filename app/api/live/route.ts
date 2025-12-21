import { NextResponse } from "next/server";
import { getLastAndNextGame } from "@/lib/providers/espn";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sport = searchParams.get("sport") || "nba"; 
  // exemples:
  // nba
  // nfl
  // soccer:soccer/fra.1

  try {
    const data = await getLastAndNextGame(sport);
    return NextResponse.json({
      ok: true,
      sport,
      last: data.last,
      next: data.next,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
