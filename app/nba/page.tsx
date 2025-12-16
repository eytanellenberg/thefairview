import { buildNBASnapshot } from "@/lib/nbaSnapshot";

type LeverStatus = "expected" | "stronger" | "weaker" | "new";

function LeverBadge({ status }: { status?: LeverStatus }) {
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

function LeverRow({
  lever,
  contribution,
  rationale,
  status
}: {
  lever: string;
  contribution: number;
  rationale: string;
  status?: LeverStatus;
}) {
  return (
    <div className="border rounded p-3 mb-2">
      <div className="flex justify-between items-center">
        <div className="font-medium">{lever}</div>
        <div className="text-sm font-semibold">
          {contribution > 0 ? `+${contribution}` : contribution}
          <LeverBadge status={status} />
        </div>
      </div>
      <div className="text-sm text-gray-600 mt-1">{rationale}</div>
    </div>
  );
}

export default async function NBAPage() {
  const data = await buildNBASnapshot();

  // 🔑 CRITICAL: defensive filtering
  const snapshot = (data.snapshot || []).filter(
    (t: any) => t && t.team && t.team.id
  );

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-10">
      <header>
        <h1 className="text-3xl font-bold">NBA — Comparative Snapshot</h1>
        <p className="text-gray-600 mt-1">
          Comparative Execution (PAI) & Comparative Readiness (RAI)
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Last update: {new Date(data.updatedAt).toLocaleString()}
        </p>
      </header>

      {snapshot.map((teamSnap: any) => (
        <section
          key={teamSnap.team.id}
          className="border rounded-lg p-6 shadow-sm"
        >
          <h2 className="text-2xl font-semibold mb-4">
            {teamSnap.team.name}
          </h2>

          {/* POST-GAME — PAI */}
          {teamSnap.comparativePAI && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-red-700 mb-2">
                Comparative Execution (PAI)
              </h3>

              <p className="font-medium mb-3">
                PAI Score: {teamSnap.comparativePAI.value}
              </p>

              {teamSnap.comparativePAI.observedLevers.map(
                (lever: any, idx: number) => (
                  <LeverRow
                    key={idx}
                    lever={lever.lever}
                    contribution={lever.contribution}
                    rationale={lever.rationale}
                    status={lever.status}
                  />
                )
              )}

              <p className="text-sm italic text-gray-700 mt-3">
                {teamSnap.comparativePAI.summary}
              </p>
            </div>
          )}

          {/* PRE-GAME — RAI */}
          {teamSnap.comparativeRAI && (
            <div>
              <h3 className="text-lg font-semibold text-blue-700 mb-2">
                Comparative Readiness (RAI)
              </h3>

              <p className="font-medium mb-3">
                RAI Score: {teamSnap.comparativeRAI.value}
              </p>

              {teamSnap.comparativeRAI.expectedLevers.map(
                (lever: any, idx: number) => (
                  <LeverRow
                    key={idx}
                    lever={lever.lever}
                    contribution={lever.contribution}
                    rationale={lever.rationale}
                  />
                )
              )}

              <p className="text-sm italic text-gray-700 mt-3">
                {teamSnap.comparativeRAI.summary}
              </p>
            </div>
          )}
        </section>
      ))}
    </main>
  );
}
