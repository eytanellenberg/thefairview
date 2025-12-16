import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      status: "demo",
      rai: { status: "disabled" },
      pai: { value: 0.62 }
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  return GET(request);
}
