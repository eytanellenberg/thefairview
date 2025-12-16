"use client";

import { useEffect, useState } from "react";

const TEAM_ID = "2"; // Boston Celtics (ESPN)

export default function NBAPage() {
  const [rai, setRAI] = useState<any>(null);
  const [pai, setPAI] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [raiRes, paiRes] = await Promise.all([
          fetch(`/api/rai?sport=nba&teamId=${TEAM_ID}`),
          fetch(`/api/pai?sport=nba&teamId=${TEAM_ID}`)
        ]);

        const raiData = await raiRes.json();
        const paiData = await paiRes.json();

        setRAI(raiData);
        setPAI(paiData);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return <div className="p-8">Loading NBA live data…</div>;
  }

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">NBA — Live FAIR Engine</h1>
        <p className="text-gray-500">
          Real NBA games · Public data · Causal attribution (RAI / PAI)
        </p>
      </header>

      {/* LAST GAME */}
      <section className="border rounded-xl p-5 space-y-3">
        <h2 className="text-xl font-semibold">Last Game (PAI)</h2>
        {pai?.status === "free" ? (
          <>
            <div className="font-medium">
              {pai.game.home.name} {pai.game.home.score} – {pai.game.away.score}{" "}
              {pai.game.away.name}
            </div>
            <div className="text-sm text-gray-500">{pai.game.venue}</div>
            <div className="text-2xl font-bold">PAI: {pai.pai}</div>
            <ul className="list-disc ml-5 text-sm">
              {pai.factors.map((f: any, i: number) => (
                <li key={i}>{f.factor}</li>
              ))}
            </ul>
          </>
        ) : (
          <div className="text-gray-500">No completed game yet.</div>
        )}
      </section>

      {/* NEXT GAME */}
      <section className="border rounded-xl p-5 space-y-3">
        <h2 className="text-xl font-semibold">Next Game (RAI)</h2>
        {rai?.status === "free" ? (
          <>
            <div className="font-medium">
              {rai.game.home.name} vs {rai.game.away.name}
            </div>
            <div className="text-sm text-gray-500">
              {new Date(rai.game.dateUtc).toLocaleString()} · {rai.game.venue}
            </div>
            <div className="text-2xl font-bold">RAI: {rai.rai}</div>
            <ul className="list-disc ml-5 text-sm">
              {rai.factors.map((f: any, i: number) => (
                <li key={i}>{f.factor}</li>
              ))}
            </ul>
          </>
        ) : (
          <div className="text-gray-500">No upcoming game.</div>
        )}
      </section>

      <footer className="text-sm text-gray-500">
        FAIR Engine — NBA live demo. Last & next game only (free tier).
      </footer>
    </main>
  );
}
