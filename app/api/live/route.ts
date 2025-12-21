import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * ⚠️ Route legacy conservée uniquement pour éviter les erreurs de build
 * Elle n'est PLUS utilisée par le site.
 */
export async function GET() {
  return NextResponse.json({
    status: "disabled",
    message: "Live endpoint deprecated. FAIR uses snapshot-based analysis.",
  });
}
