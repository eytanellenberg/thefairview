import { buildNBASnapshot } from "@/lib/nbaSnapshot";
import { InfoTooltip } from "@/app/components/InfoTooltip";

type LeverStatus = "expected" | "stronger" | "weaker" | "new";

function StatusBadge({ status }: { status?: LeverStatus }) {
  if (!status) return null;

  const styles: Record<LeverStatus, string> = {
    expected: "bg-gray-200 text-gray-800",
    stronger: "bg-green-200 text-green-800",
    weaker: "bg-red-200 text-red-800",
    new: "bg-orange-200 text-orange-800"
  };

  const labels: Record<LeverStatus, string> = {
    expected: "as expected",
    stronger: "stronger",
    weaker: "weaker",
    new: "NEW"
  };

  return (
    <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export default async function HomePage() {
  const data = await buildNBASnapshot();
  const snapshot = (data.snapshot || []).filter((t: any) => t?.team?.id);

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-10 bg-white text-gray-900">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">The Fair View — NBA</h1>

        <p className="text-sm text-gray-700">
          <strong>Comparative Readiness (RAI)</strong> is the <strong>pre-game</strong> matchup-relative hypothesis:
          which <strong>3 structural levers</strong> are expected to matter most between the two teams, and their relative weights.
        </p>

        <p className="text-sm text-gray-700">
          <strong>Comparative Execution (PAI)</strong> is the <strong>post-game</strong> verification:
          it measures how those <strong>same levers</strong> were actually executed (stronger/weaker, order changes).
          <strong> NEW</strong> is rare and signals an emergent lever that became dominant unexpectedly.
        </p>

        <p className="text-xs text-gray-500">
          Pre-game: RAI defines the hypothesis · Post-game: PAI tests it.
        </p>

        <p className="text-xs text-gray-400">
          Last update: {new Date(data.updatedAt).toLocaleString()}
        </p>
      </header>

      <div className="space-y-6">
        {snapshot.map((teamSnap: any) => (
          <section key={teamSnap.team.id} className="border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold">{teamSnap.team.name}</h2>

            {teamSnap.comparativeRAI && (
              <div className="mt-3">
                <div className="font-semibold text-blue-700">
                  Comparative Readiness (RAI)
                  <InfoTooltip text="Pre-game, opponent-relative hypothesis. Top 3 levers expected to influence the matchup." />
                </div>
                <div className="text-sm mt-1">RAI score: {teamSnap.comparativeRAI.value}</div>
              </div>
            )}

            {teamSnap.comparativePAI && (
              <div className="mt-3">
                <div className="font-semibold text-red-700">
                  Comparative Execution (PAI)
                  <InfoTooltip text="Post-game verification of execution on the SAME levers as RAI. NEW is rare and indicates an emergent lever." />
                </div>
                <div className="text-sm mt-1">PAI score: {teamSnap.comparativePAI.value}</div>

                <div className="mt-3 space-y-2">
                  {(teamSnap.comparativePAI.observedLevers || []).map((l: any, i: number) => (
                    <div key={i} className="border rounded p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">
                          {l.lever}
                          <InfoTooltip text="Same lever as in RAI. Status shows deviation vs pre-game expectation." />
                        </div>
                        <div className="text-sm font-semibold">
                          {l.contribution > 0 ? `+${l.contribution}` : l.contribution}
                          <StatusBadge status={l.status} />
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{l.rationale}</div>
                    </div>
                  ))}
                </div>

                <div className="text-sm italic text-gray-700 mt-3">
                  {teamSnap.comparativePAI.summary}
                </div>
              </div>
            )}
          </section>
        ))}
      </div>

      <footer className="text-center text-xs text-gray-400 mt-10">
        Analyses avancées disponibles pour analystes et clubs — contact@thefairview.com
      </footer>
    </main>
  );
}
