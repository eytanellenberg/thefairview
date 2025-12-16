import { NextResponse } from "next/server";
import { buildNBASnapshot } from "@/lib/nbaSnapshot";

export const revalidate = 6 * 60 * 60; // 6h

export async function GET() {
  const data = await buildNBASnapshot();
  return NextResponse.json(data);
}
