import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="space-y-6 text-center">
        <h1 className="text-4xl font-bold">TheFairView</h1>
        <p className="text-gray-600">
          Sports performance analysis through causal attribution (FAIR)
        </p>

        <div className="grid grid-cols-1 gap-4 mt-8">
          <Link
            href="/nba"
            className="border rounded-xl p-6 hover:bg-gray-50"
          >
            <h2 className="text-2xl font-semibold">NBA</h2>
            <p className="text-sm text-gray-500">
              Live — last & next match per team
            </p>
          </Link>

          <div className="border rounded-xl p-6 opacity-50">
            <h2 className="text-2xl font-semibold">NFL</h2>
            <p className="text-sm text-gray-500">Coming soon</p>
          </div>

          <div className="border rounded-xl p-6 opacity-50">
            <h2 className="text-2xl font-semibold">MLB</h2>
            <p className="text-sm text-gray-500">Coming soon</p>
          </div>

          <div className="border rounded-xl p-6 opacity-50">
            <h2 className="text-2xl font-semibold">Soccer</h2>
            <p className="text-sm text-gray-500">Coming soon</p>
          </div>
        </div>
      </div>
    </main>
  );
}
