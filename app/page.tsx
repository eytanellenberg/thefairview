"use client"

import { useEffect, useState } from "react"

export default function HomePage() {
  const [rai, setRai] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadRAI = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/rai")
        if (!res.ok) throw new Error("RAI API not available")

        const data = await res.json()
        if (!data || !data.rai) throw new Error("Invalid RAI data")

        setRai(data.rai)
      } catch (e) {
        console.error(e)
        setError("RAI calculation temporarily unavailable")
        setRai(null)
      } finally {
        setLoading(false)
      }
    }

    loadRAI()
  }, [])

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <h1 className="text-4xl font-bold mb-2">TheFairView</h1>
      <p className="text-slate-400 mb-6">
        Sports Performance Analysis through Causal Attribution
      </p>

      <div className="rounded-xl bg-slate-900 p-6 max-w-xl">
        <h2 className="text-xl font-semibold mb-4">RAI – Readiness Attribution Index</h2>

        {loading && (
          <p className="text-slate-400">Loading RAI…</p>
        )}

        {error && (
          <div className="rounded bg-yellow-900/30 p-4 text-yellow-200">
            {error}
            <div className="text-xs opacity-70 mt-1">
              Demo mode – live engine under calibration
            </div>
          </div>
        )}

        {rai && (
          <div className="space-y-2">
            <div>
              <strong>Score:</strong> {rai.score ?? "N/A"}
            </div>

            {rai.factors && Array.isArray(rai.factors) ? (
              <ul className="list-disc list-inside text-slate-300">
                {rai.factors.map((f: any, i: number) => (
                  <li key={i}>
                    {f.name ?? "Factor"} – {f.value ?? "?"}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 text-sm">
                No factor-level data available
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
