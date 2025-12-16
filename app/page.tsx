import Link from "next/link";

export default function HomePage() {
  return (
    <main className="p-6 max-w-4xl mx-auto text-gray-900 bg-white">
      <h1 className="text-3xl font-semibold mb-4">
        The Fair View
      </h1>

      <p className="text-base text-gray-700 mb-6">
        FAIR applies causal reasoning to sports analysis.
        <br />
        Not predictive. Comparative. Match-based.
      </p>

      {/* HOW IT WORKS */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">
          How it works
        </h2>
        <ul className="list-disc ml-6 text-sm text-gray-700">
          <li>
            <strong>RAI</strong> — what was structurally expected before the game
          </li>
          <li>
            <strong>Levers</strong> — where the comparative edge was
          </li>
          <li>
            <strong>PAI</strong> — what actually decided the game
          </li>
        </ul>
        <p className="text-sm text-gray-600 mt-2">
          This is a causal framework, not a prediction model.
        </p>
      </div>

      {/* LIVE SPORTS */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">
          Live sports
        </h2>
        <div className="flex flex-col gap-2">
          <Link
            href="/nba"
            className="border rounded p-3 hover:bg-gray-50"
          >
            <strong>NBA</strong> — last game analysis (FREE)
          </Link>

          <Link
            href="/nfl"
            className="border rounded p-3 hover:bg-gray-50"
          >
            <strong>NFL</strong> — last game analysis (FREE)
          </Link>
        </div>
      </div>

      {/* ANALYSTS & CLUBS */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">
          For analysts & clubs
        </h2>
        <p className="text-sm text-gray-700">
          Analyses can become significantly more precise when internal team data
          are integrated: expanded levers, deeper pre-game modeling, and
          customized causal attribution.
        </p>
        <p className="text-sm text-gray-700 mt-2">
          Contact: <strong>eytan_ellenberg@yahoo.fr</strong>
        </p>
      </div>

      <footer className="text-xs text-gray-500 mt-10">
        FAIR — structure over narrative
      </footer>
    </main>
  );
}
