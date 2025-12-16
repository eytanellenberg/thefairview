import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
      <div className="max-w-xl w-full px-6 space-y-10 text-center">
        <header className="space-y-4">
          <h1 className="text-4xl font-bold">The Fair View</h1>

          <p className="text-gray-700 text-sm">
            Comparative sport analytics based on <strong>pre-game readiness</strong> and
            <strong> post-game execution</strong>.
          </p>
        </header>

        {/* SPORT SELECTION */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Choose your sport</h2>

          <Link
            href="/nba"
            className="block border rounded-lg p-4 hover:bg-gray-50 transition"
          >
            <div className="text-xl font-medium">🏀 NBA</div>
            <div className="text-sm text-gray-600 mt-1">
              Readiness & Execution analysis
            </div>
          </Link>
        </section>

        {/* MINI EXPLANATION */}
        <section className="space-y-3 text-left text-sm text-gray-700">
          <p>
            <strong>RAI (Comparative Readiness)</strong> is a <strong>pre-game</strong> assessment.
            It identifies which <strong>structural levers</strong> are expected to make the
            difference between two teams.
          </p>

          <p>
            <strong>PAI (Comparative Execution)</strong> is a <strong>post-game</strong> verification.
            It measures how those <strong>same levers</strong> were actually executed.
          </p>

          <p>
            <strong>Levers</strong> are stable structural dimensions (spacing, defensive continuity,
            matchup stress). They are defined <strong>before the game</strong> and evaluated
            <strong>after</strong>.
          </p>
        </section>

        {/* CONTACT */}
        <footer className="pt-6 border-t text-xs text-gray-500">
          Advanced analyses for analysts and clubs<br />
          <span className="font-medium">contact@thefairview.com</span>
        </footer>
      </div>
    </main>
  );
}
