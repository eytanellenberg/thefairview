import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
const { searchParams } = new URL(request.url);

const gameId = searchParams.get("gameId") ?? "demo-game";
const teamId = searchParams.get("teamId") ?? "demo-team";

return NextResponse.json(
 {
   status: "demo",
   rai: {
     status: "disabled"
   },
   pai: {
     value: 0.62
   }
 },
 { status: 200 }
);
}

export async function POST(request: NextRequest) {
return GET(request);
}
