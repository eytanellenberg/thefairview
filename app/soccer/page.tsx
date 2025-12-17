import Link from "next/link";

export default function SoccerHomePage() {
  return (
    <main className="p-6 max-w-4xl mx-auto text-gray-900 bg-white">
      <h1 className="text-2xl font-semibold mb-4">
        Soccer — European Leagues
      </h1>

      <p className="text-sm text-gray-700 mb-6">
        FAIR applies the same causal framework used in NBA and NFL
        to European football.
        <br />
        Risk-adjusted comparison before the game (RAI),
        causal attribution after the game (PAI).
      </p>

      {/* LEAGUE SELECTION */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">
          Select a league
        </h2>

        <div className="flex flex-col gap-2">
          <Link
            href="/soccer/premier-league"
            className="border rounded p-3 hover:bg-gray-50"
          >
            🇬🇧 <strong>Premier League</strong>
          </Link>

          <Link
            href="/soccer/la-liga"
            className="border rounded p-3 hover:bg-gray-50"
          >
            🇪🇸 <strong>La Liga</strong>
          </Link>

          <Link
            href="/soccer/serie-a"
            className="border rounded p-3 hover:bg-gray-50"
          >
            🇮🇹 <strong>Serie A</strong>
          </Link>

          <Link
            href="/soccer/bundesliga"
            className="border rounded p-3 hover:bg-gray-50"
          >
            🇩🇪 <strong>Bundesliga</strong>
          </Link>

          <Link
            href="/soccer/ligue-1"
            className="border rounded p-3 hover:bg-gray-50"
          >
            🇫🇷 <strong>Ligue 1</strong>
          </Link>
        </div>
      </div>

      {/* METHOD REMINDER */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">
          Method
        </h2>
        <ul className="list-disc ml-6 text-sm text-gray-700">
          <li>
            <strong>RAI</strong> — structural edge before kickoff
          </li>
          <li>
            <strong>3 levers</strong> — team strength, context, availability
          </li>
          <li>
            <strong>PAI</strong> — what actually decided the match
          </li>
        </ul>
      </div>

      <footer className="text-xs text-gray-500 mt-10">
        Data source: ESPN · FAIR causal framework
      </footer>
    </main>
  );
}
