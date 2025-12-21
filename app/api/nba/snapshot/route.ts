import { NextResponse } from "next/server";
import { computeNBAAutoSnapshot } from "@/lib/nbaAutoSnapshot";

export async function GET() {
  const data = computeNBAAutoSnapshot();
  return NextResponse.json(data);
}
