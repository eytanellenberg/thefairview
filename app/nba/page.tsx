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

export default async function NBAPage() {
  const data = await buildNBASnapshot();
  const snapshot = (data.snapshot || []).filter((t: any) => t?.team?.id);

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-8 bg-white text-gray-900">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">NBA — Comparative RAI & PAI</h1>
        <p className="text-sm text-gray-700">
          <strong>RAI</strong> (pre-game) defines which levers should matter most in the matchup.
          <strong> PAI</strong> (post-game) verifies execution on the <strong>same levers</strong>.
          <strong> NEW</strong> is rare and flags an emergent lever that became dominant unexpectedly.
        </p>
        <p className="text-xs text-gray-400">
          Last update: {new Date(data.updatedAt).toLocaleString()}
        </p>
      </header>

      {snapshot.map((teamSnap: any) => (
        <section key={teamSnap.team.id} className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">{teamSnap.team.name}</h2>

          {teamSnap.comparativeRAI && (
            <div className="mb-6">
              <h3 className="font-semibold text-blue-700">
                Comparative Readiness (RAI)
                <InfoTooltip text="Pre-game hypothesis (matchup-relative): top 3 levers expected to influence the outcome." />
              </h3>
              <p className="text-sm mt-1">RAI score: {teamSnap.comparativeRAI.value}</p>

              <div className="mt-3 space-y-2">
                {(teamSnap.comparativeRAI.expectedLevers || []).map((l: any, i: number) => (
                  <div key={i} className="border rounded p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">
                        {l.lever}
                        <InfoTooltip text="Pre-game lever. Weight reflects expected relative influence in this matchup." />
                      </div>
                      <div className="text-sm font-semibold">
                        {l.contribution > 0 ? `+${l.contribution}` : l.contribution}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{l.rationale}</div>
                  </div>
                ))}
              </div>

              <div className="text-sm italic text-gray-700 mt-3">
                {teamSnap.comparativeRAI.summary}
              </div>
            </div>
          )}

          {teamSnap.comparativePAI && (
            <div>
              <h3 className="font-semibold text-red-700">
                Comparative Execution (PAI)
                <InfoTooltip text="Post-game verification: execution on the SAME levers as RAI. Status shows stronger/weaker vs expectation. NEW is rare." />
              </h3>
              <p className="text-sm mt-1">PAI score: {teamSnap.comparativePAI.value}</p>

              <div className="mt-3 space-y-2">
                {(teamSnap.comparativePAI.observedLevers || []).map((l: any, i: number) => (
                  <div key={i} className="border rounded p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">
                        {l.lever}
                        <InfoTooltip text="Same lever as in RAI. Status indicates deviation vs pre-game expectation." />
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

      <footer className="text-center text-xs text-gray-400 mt-8">
        Analyses avancées disponibles pour analystes et clubs — contact@thefairview.com
      </footer>
    </main>
  );
}
