import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold">TheFairView</h1>
        <p className="text-slate-400">
          Sports Performance Analysis through Causal Attribution
        </p>

        <div className="rounded-xl bg-slate-900 p-5 space-y-3">
          <div className="text-slate-300">
            Free demo: pick a sport → latest matches per team (RAI pre + PAI post + levers + alignment) → next match RAI forecast.
          </div>
          <Link
            href="/sports"
            className="inline-block rounded-lg bg-slate-800 px-4 py-2 hover:bg-slate-700"
          >
            Open Sports Demo
          </Link>
        </div>
      </div>
    </main>
  );
}
