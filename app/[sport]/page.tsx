'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function SportPage() {
  const params = useParams();
  const sport = params?.sport as string;

  const mockRAI = {
    overall: 73,
    confidence: 82,
    narrative: {
      title: "Strong Readiness via Tactical Edge",
      summary: "Team shows high readiness across all dimensions",
      keyPoints: [
        "Stable lineup creates offensive rhythm",
        "Favorable matchup history",
        "Key players optimally rested"
      ]
    },
    topLevers: [
      {
        id: "1",
        name: "Offensive Rhythm",
        category: "team" as const,
        value: 78,
        weight: 34,
        description: "Stable lineup with high cohesion",
        stats: [
          { label: "Games Together", value: 12, unit: "" },
          { label: "Offensive Rating", value: 118.3, unit: "pts/100" }
        ]
      },
      {
        id: "2",
        name: "Match-up Advantage",
        category: "opponent" as const,
        value: 71,
        weight: 31,
        description: "Historical edge vs opponent",
        stats: [
          { label: "Win %", value: 62, unit: "%" },
          { label: "PnR Defense", value: 48.3, unit: "%" }
        ]
      },
      {
        id: "3",
        name: "Player Readiness",
        category: "individual" as const,
        value: 69,
        weight: 29,
        description: "Optimal rest and form",
        stats: [
          { label: "Days Rest", value: 2, unit: "" },
          { label: "Recent PPG", value: 26.4, unit: "" }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-blue-600"><ArrowLeft className="w-6 h-6" /></Link>
            <h1 className="text-2xl font-bold uppercase">{sport}</h1>
          </div>
          <Link href="/premium" className="bg-blue-600 text-white px-4 py-2 rounded">Upgrade</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl p-8 card-shadow mb-8">
          <div className="flex justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Next Match - RAI Pre-Game</h2>
              <p className="text-gray-600">Readiness prediction</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-green-600">{mockRAI.overall}</div>
              <p className="text-sm text-gray-600">Confidence: {mockRAI.confidence}%</p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h3 className="font-bold mb-2">{mockRAI.narrative.title}</h3>
            <p className="text-gray-700 mb-4">{mockRAI.narrative.summary}</p>
            <ul className="space-y-2">
              {mockRAI.narrative.keyPoints.map((point, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-green-600 mr-2">▸</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <h3 className="font-bold mb-4">Top 3 Readiness Drivers</h3>
          <div className="space-y-4">
            {mockRAI.topLevers.map((lever, i) => (
              <div key={lever.id} className="border rounded-lg p-6">
                <div className="flex justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl font-bold text-gray-400">#{i+1}</span>
                      <h4 className="text-lg font-bold">{lever.name}</h4>
                    </div>
                    <span className="inline-block px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {lever.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{lever.value}</div>
                    <p className="text-sm text-gray-600">{lever.weight}% weight</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{lever.description}</p>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded p-4">
                  {lever.stats.map((stat, j) => (
                    <div key={j}>
                      <p className="text-xs text-gray-600">{stat.label}</p>
                      <p className="font-semibold">{stat.value} {stat.unit}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8">
          <h3 className="text-xl font-bold mb-2">Want Deeper Insights?</h3>
          <p className="mb-4">Premium gets you all levers, advanced patterns, and historical data</p>
          <Link href="/premium" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg">
            Explore Premium
          </Link>
        </div>
      </main>
    </div>
  );
}
