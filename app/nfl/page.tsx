// app/nfl/page.tsx

import { computeNFLBigScoreSnapshot } from "@/lib/nflBigScore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NFLPage() {
  const data = await computeNFLBigScoreSnapshot();

  return (
    <main className="p-6 max-w-5xl mx-auto bg-white text-gray-900">
      <h1 className="text-2xl font-semibold mb-2">
        NFL — LAST GAME (All Teams)
      </h1>

      <p className="text-sm text-gray-600 mb-6">
        Updated at {new Date(data.updatedAt).toLocaleString()} · Teams:{" "}
        {data.teams.length}
      </p>

      {data.teams.map((t, i) => (
        <section key={i} className="mb-4 border-b pb-3">
          <p className="font-semibold">{t.team}</p>
          <p className="text-sm">
            vs {t.opponent} · {t.score} {t.isHome ? "(home)" : "(away)"}
          </p>
        </section>
      ))}

      <footer className="text-xs text-gray-500 mt-10">
        FAIR — structure over narrative · eytan_ellenberg@yahoo.fr
      </footer>
    </main>
  );
}
