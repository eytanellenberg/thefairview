import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-black flex items-center justify-center">
      <div className="space-y-8 text-center">
        <h1 className="text-4xl font-bold">TheFairView</h1>
        <p className="text-lg">
          Sports performance analysis through causal attribution (FAIR)
        </p>

        <div className="space-y-4">
          <Link
            href="/nba"
            className="block text-2xl font-semibold underline"
          >
            NBA
          </Link>

          <div className="text-gray-400 text-xl">NFL (coming soon)</div>
          <div className="text-gray-400 text-xl">MLB (coming soon)</div>
          <div className="text-gray-400 text-xl">Soccer (coming soon)</div>
        </div>
      </div>
    </main>
  );
}
