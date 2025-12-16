import Link from "next/link";

const SPORTS = [
  { key: "nba", name: "NBA", desc: "Basketball — readiness → impact attribution", href: "/sports?sport=nba" },
  { key: "nfl", name: "NFL", desc: "American football — readiness & game impact", href: "/sports?sport=nfl" },
  { key: "mlb", name: "MLB", desc: "Baseball — pitching/roster → impact", href: "/sports?sport=mlb" },
  { key: "soccer", name: "Soccer", desc: "Global football — Europe / Americas / Asia", href: "/sports?sport=soccer" }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-6 py-14 space-y-10">
        <header className="space-y-3">
          <h1 className="text-4xl font-bold">TheFairView</h1>
          <p className="text-gray-400 max-w-2xl">
            Sports performance analysis through causal attribution (FAIR).
            Live data mode: last match + next match (free). Historical backtests are premium.
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SPORTS.map((s) => (
            <Link
              key={s.key}
              href={s.href}
              className="rounded-2xl border border-gray-800 bg-zinc-950 p-5 hover:bg-zinc-900 transition"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{s.name}</h2>
                <span className="text-xs px-2 py-1 rounded-full border border-gray-700 text-gray-300">
                  Free: last + next
                </span>
              </div>
              <p className="text-gray-400 mt-2">{s.desc}</p>
            </Link>
          ))}
        </section>

        <section className="rounded-2xl border border-gray-800 bg-zinc-950 p-6 space-y-2">
          <h3 className="text-lg font-semibold">Club / analyst integration</h3>
          <p className="text-gray-400">
            Add club signals (availability, training load, internal KPIs) to upgrade RAI/PAI precision.
          </p>
          <a className="text-white underline" href="mailto:eytan_ellenberg@yahoo.fr">
            eytan_ellenberg@yahoo.fr
          </a>
        </section>
      </div>
    </main>
  );
}
