export default function WorldCup2026Page() {
  return (
    <main className="max-w-5xl mx-auto p-6 bg-white text-gray-900">
      <h1 className="text-3xl font-semibold mb-2">
        FIFA World Cup 2026
      </h1>

      <p className="text-gray-600 mb-6">
        FAIR tournament analysis, rankings and predictions.
      </p>

      <section className="border rounded-lg p-4 bg-gray-50">
        <h2 className="text-xl font-semibold mb-3">
          Tournament Overview
        </h2>

        <ul className="space-y-2">
          <li>Hosts: United States, Canada, Mexico</li>
          <li>Teams: 48</li>
          <li>Matches: 104</li>
          <li>Tournament Year: 2026</li>
        </ul>
      </section>

      <section className="mt-6 border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-3">
          FAIR Prediction Center
        </h2>

        <p>
          National team rankings, tournament readiness scores,
          player impact attribution and World Cup simulations
          will be available here.
        </p>
      </section>
    </main>
  );
}
