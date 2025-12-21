export type TeamRecentFormNBA = {
  team: string;
  lastGames: {
    scored: number;
    allowed: number;
  }[];
};

export type DeltaRAIResult = {
  edge: number;
  levers: {
    lever: string;
    value: number;
  }[];
};

const NET_WEIGHT = 0.5;
const OFF_WEIGHT = 0.3;
const DEF_WEIGHT = 0.3;
const HOME_WEIGHT = 0.4;

function avg(values: number[]) {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function computeNBADeltaRAI(
  home: TeamRecentFormNBA,
  away: TeamRecentFormNBA
): DeltaRAIResult {
  const homeScored = avg(home.lastGames.map(g => g.scored));
  const homeAllowed = avg(home.lastGames.map(g => g.allowed));

  const awayScored = avg(away.lastGames.map(g => g.scored));
  const awayAllowed = avg(away.lastGames.map(g => g.allowed));

  const homeNet = homeScored - homeAllowed;
  const awayNet = awayScored - awayAllowed;

  const netRating =
    (homeNet - awayNet) * NET_WEIGHT;

  const offense =
    (homeScored - awayScored) * OFF_WEIGHT;

  const defense =
    (awayAllowed - homeAllowed) * DEF_WEIGHT;

  const homeContext = HOME_WEIGHT;

  const edge =
    netRating +
    offense +
    defense +
    homeContext;

  return {
    edge: Number(edge.toFixed(2)),
    levers: [
      {
        lever: "Recent net rating",
        value: Number(netRating.toFixed(2))
      },
      {
        lever: "Offensive form",
        value: Number(offense.toFixed(2))
      },
      {
        lever: "Defensive form",
        value: Number(defense.toFixed(2))
      },
      {
        lever: "Home court context",
        value: homeContext
      }
    ]
  };
}
