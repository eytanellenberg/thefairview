// app/soccer/champions-league/page.tsx
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ChampionsLeaguePage() {
  return (
    <main className="max-w-4xl mx-auto p-6 bg-white text-gray-900">
      <h1 className="text-2xl font-semibold mb-2">Champions League — FAIR Analysis</h1>
      <p className="text-sm text-gray-600 mb-6">
        Coming soon. This page will list match-by-match cards (RAI / PAI / FAIR Surprise).
      </p>

      <Link
        href="/soccer"
        className="inline-flex items-center px-4 py-2 rounded-lg border bg-gray-900 text-white hover:bg-gray-800"
      >
        ← Back to European Soccer
      </Link>

      <footer className="text-xs text-gray-500 mt-10">
        FAIR — structure over narrative · eytan_ellenberg@yahoo.fr
      </footer>
    </main>
  );
}
