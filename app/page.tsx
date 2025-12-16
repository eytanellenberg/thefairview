import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-black flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">TheFairView</h1>

        <p className="text-lg">
          Sports performance analysis through causal attribution (FAIR)
        </p>

        <div className="space-y-3 pt-4">
          <Link
            href="/nba"
            className="block text-2xl font-semibold underline"
          >
            NBA
          </Link>

          <div className="text-xl text-gray-400">NFL (coming soon)</div>
          <div className="text-xl text-gray-400">MLB (coming soon)</div>
          <div className="text-xl text-gray-400">Soccer (coming soon)</div>
        </div>
      </div>
    </main>
  );
}
