import { buildNBASnapshot } from "@/lib/nbaSnapshot";

function matchKey(dateUtc: string, a: string, b: string) {
  return `${dateUtc}-${[a, b].sort().join("-")}`;
}

export default async function NBAPage() {
  const data = await buildNBASnapshot();

  const matches: Record<string, any[]> = {};

  for (const entry of data.snapshot) {
    if (!entry.lastGame) continue;

    const key = matchKey(
      entry.lastGame.dateUtc,
      entry.team.id,
      entry.lastGame.opponentId
    );

    if (!matches[key]) matches[key] = [];

    matches[key].push(entry);
  }

  const playedMatches = Object.values(matches).filter(m => m.length === 2);

  return (
    <main className="p-6 max-w-5xl mx-auto text-gray-900 bg-white">
      <h1 className="text-2xl font-semibold mb-2">
        NBA — Match-based FAIR Analysis
      </h1>

      <p className="text-sm text-gray-600 mb-6">
        One card per match. Post-game execution (PAI) explains what happened.
        Pre-game readiness (RAI) explains what was expected.
      </p>

      <h2 className="text-lg font-semibold mb-4">Played matches</h2>

      {playedMatches.length === 0 && (
        <p className="text-sm text-gray-500">
          No completed matches available.
        </p>
      )}

      {playedMatches.map((match, i) => {
        const teamA = match[0];
        const team
