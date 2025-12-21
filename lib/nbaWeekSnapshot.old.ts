import { computeNBADeltaRAI, TeamRecentFormNBA } from "./nbaDeltaRAI";

export function computeNBAWeekSnapshot() {
  // 🔧 MOCK STRUCTURÉ (remplaçable ESPN plus tard)

  const clippers: TeamRecentFormNBA = {
    team: "LA Clippers",
    lastGames: [
      { scored: 112, allowed: 104 },
      { scored: 118, allowed: 110 },
      { scored: 109, allowed: 102 },
      { scored: 121, allowed: 115 },
      { scored: 114, allowed: 108 }
    ]
  };

  const lakers: TeamRecentFormNBA = {
    team: "Los Angeles Lakers",
    lastGames: [
      { scored: 108, allowed: 112 },
      { scored: 110, allowed: 116 },
      { scored: 115, allowed: 118 },
      { scored: 104, allowed: 109 },
      { scored: 111, allowed: 113 }
    ]
  };

  const rai = computeNBADeltaRAI(clippers, lakers);

  return {
    sport: "nba",
    scope: "last-completed-games",
    updatedAt: new Date().toISOString(),
    matches: [
      {
        matchup: "LA Clippers vs Los Angeles Lakers",
        finalScore: "103 – 88",
        rai,
        pai: {
          LAClippers: {
            execution: +1.35
          },
          LosAngelesLakers: {
            execution: -1.35
          }
        }
      }
    ]
  };
}
