import {
  getSoccerGames,
  getSoccerMatchStats,
  NormalizedGame,
} from "@/lib/providers/espn";
import { FIFA_RANKINGS } from "@/lib/data/fifaRankings";

/* ================= TYPES ================= */

export type FAIRLever = {
  label: string;
  value: number;
};

export type FAIRSurprise = {
  isSurprise: boolean;
  winner: string;
  raiFavored: string;
  logicalOutcome: number;
  score: number;
  level: "MINOR" | "MODERATE" | "MAJOR" | "NONE";
};

export type FAIRTeamPAI = {
  name: string;
  levers: FAIRLever[];
};
export type FAIRPAI = {
  home: FAIRTeamPAI;
  away: FAIRTeamPAI;
  intensityAbs: number;
};

export type FAIRMatch = {
  matchup: string;
  finalScore: string;
  dateUtc: string;
  rai: {
    edge: string;
    value: number;
    levers: FAIRLever[];
  };
  pai: {
    teamA: FAIRTeamPAI;
    teamB: FAIRTeamPAI;
  };
  surprise: FAIRSurprise;
};

export type WorldCup2026AutoSnapshot = {
  updatedAt: string;
  matches: FAIRMatch[];
  topSurprises: {
    matchup: string;
    raiEdge: string;
    logicalOutcome: number;
    score: number;
    level: "MINOR" | "MODERATE" | "MAJOR";
  }[];
};


/* ================= HELPERS ================= */

const r2 = (n: number) => Math.round(n * 100) / 100;

const clamp = (
  n: number,
  min: number,
  max: number
) => Math.max(min, Math.min(max, n));

function finalScore(g: NormalizedGame) {
  if (g.home.score === null || g.away.score === null) {
    return "—";
  }

  return `${g.home.score} – ${g.away.score}`;
}

function margin(g: NormalizedGame) {
  if (g.home.score === null || g.away.score === null) {
    return 0;
  }

  return g.home.score - g.away.score;
}

function winner(g: NormalizedGame) {
  if (!g.winner) return null;

  return g.winner === "HOME"
    ? g.home.name
    : g.away.name;
}

/* ================= RAI ================= */

function computeRAI(g: NormalizedGame) {
  const homeRank =
    FIFA_RANKINGS[g.home.name] ?? 1500;

  const awayRank =
    FIFA_RANKINGS[g.away.name] ?? 1500;

  const diff = homeRank - awayRank;

  const rankingEdge = r2(diff / 50);

  const edgeTeam =
    diff >= 0
      ? g.home.name
      : g.away.name;

  const favoredEdge =
    Math.abs(rankingEdge);

return {
  edgeTeam,
  valueAbs: favoredEdge,

  levers: [
    {
      label: "FIFA ranking differential",
      value: favoredEdge,
    },
  ],
};
} 
/* ================= PAI ================= */

function stat(
  team: any,
  name: string
): number {
  const s = team.statistics?.find(
    (x: any) => x.name === name
  );

  return Number(
    s?.displayValue ?? 0
  );
}
function computePAI(
  g: NormalizedGame,
  stats: any
): FAIRPAI {
  const home =
    stats?.boxscore?.teams?.[0];

  const away =
    stats?.boxscore?.teams?.[1];

  if (!home || !away) {
    return {
      home: {
        name: g.home.name,
        levers: [],
      },
      away: {
        name: g.away.name,
        levers: [],
      },
      intensityAbs: 0,
    };
  }

const possessionEdge =
  r2(
    (stat(home,"possessionPct") -
     stat(away,"possessionPct")) / 10
  );

const shotEdge =
  r2(
    (stat(home,"totalShots") -
     stat(away,"totalShots")) / 4
  );

const targetEdge =
  r2(
    (stat(home,"shotsOnTarget") -
     stat(away,"shotsOnTarget")) / 2
  );

const passEdge =
  r2(
    (stat(home,"passPct") -
     stat(away,"passPct")) * 10
  );

const defenseEdge =
  r2(
    (
      stat(home,"effectiveTackles") +
      stat(home,"interceptions")
    -
      stat(away,"effectiveTackles") -
      stat(away,"interceptions")
    ) / 5
  );

  return {
  home: {
    name: g.home.name,

    levers: [
      {
        label: "Possession control",
        value: possessionEdge,
      },
      {
        label: "Shot generation",
        value: shotEdge,
      },
      {
        label: "Shot accuracy",
        value: targetEdge,
      },
      {
        label: "Passing efficiency",
        value: passEdge,
      },
      {
        label: "Defensive pressure",
        value: defenseEdge,
      },
    ],
  },

  away: {
    name: g.away.name,

    levers: [
      {
        label: "Possession control",
        value: -possessionEdge,
      },
      {
        label: "Shot generation",
        value: -shotEdge,
      },
      {
        label: "Shot accuracy",
        value: -targetEdge,
      },
      {
        label: "Passing efficiency",
        value: -passEdge,
      },
      {
        label: "Defensive pressure",
        value: -defenseEdge,
      },
    ],
  },

  intensityAbs:
    (
      Math.abs(possessionEdge) +
      Math.abs(shotEdge) +
      Math.abs(targetEdge) +
      Math.abs(passEdge) +
      Math.abs(defenseEdge)
    ) / 5,
};
}
  

/* ================= SURPRISE ================= */

function level(
  score: number
): "MINOR" | "MODERATE" | "MAJOR" {
  if (score < 0.75) return "MINOR";
  if (score < 1.75) return "MODERATE";
  return "MAJOR";
}

function computeSurprise(
  g: NormalizedGame,
  rai: ReturnType<typeof computeRAI>,
  pai: FAIRPAI
): FAIRSurprise {
const w = winner(g);

/* DRAW CASE */

if (!w) {
  const drawDeviation = rai.valueAbs >= 2;

  if (!drawDeviation) {
    return {
      isSurprise: false,
      winner: "Draw",
      raiFavored: rai.edgeTeam,
      logicalOutcome: 0,
      score: 0,
      level: "NONE",
    };
  }

const score = rai.valueAbs;

  return {
    isSurprise: true,
    winner: "Draw",
    raiFavored: rai.edgeTeam,
    logicalOutcome: -rai.valueAbs,
    score,
    level: level(score),
  };
}

  const isSurprise =
    w !== rai.edgeTeam;

  const logicalOutcome =
    isSurprise
      ? -rai.valueAbs
      : rai.valueAbs;

  if (!isSurprise) {
    return {
      isSurprise: false,
      winner: w,
      raiFavored: rai.edgeTeam,
      logicalOutcome,
      score: 0,
      level: "NONE",
    };
  }

const score = rai.valueAbs;

  return {
    isSurprise: true,
    winner: w,
    raiFavored: rai.edgeTeam,
    logicalOutcome,
    score,
    level: level(score),
  };
}

export async function computeWorldCup2026AutoSnapshot(): Promise<WorldCup2026AutoSnapshot> {
  console.log("DEBUG 1");

  const games = await getSoccerGames(
    "soccer/fifa.world"
  );

  console.log(
    "DEBUG 2",
    games.length
  );

if (games.length > 0) {
  const stats =
    await getSoccerMatchStats(
      "soccer/fifa.world",
      games[0].id
    );

  console.log(
    "MATCH STATS",
    JSON.stringify(
      stats,
      null,
      2
    )
  );
}

  console.log("DEBUG 6");

  const last24h =
    Date.now() - 24 * 60 * 60 * 1000;

  const finals = games
    .filter(
      (g) =>
        g.status === "FINAL" &&
        new Date(g.dateUtc).getTime() >= last24h
    )
    .sort(
      (a, b) =>
        new Date(b.dateUtc).getTime() -
        new Date(a.dateUtc).getTime()
    );

  console.log(
    "DEBUG 7 FINALS",
    finals.length
  );

const matches = await Promise.all(
  finals.map(async (g): Promise<FAIRMatch> => {
    console.log(
      "DEBUG MATCH",
      g.home.name,
      g.away.name
    );

    const rai = computeRAI(g);

    const stats =
      await getSoccerMatchStats(
        "soccer/fifa.world",
        g.id
      );

    console.log(
      "MATCH STATS",
      g.home.name,
      JSON.stringify(stats)
    );

    const pai = computePAI(
      g,
      stats
    );

    const surprise =
      computeSurprise(
        g,
        rai,
        pai
      );

    return {
      matchup: `${g.home.name} vs ${g.away.name}`,
      finalScore: finalScore(g),
      dateUtc: g.dateUtc,

      rai: {
        edge: rai.edgeTeam,
        value: rai.valueAbs,
        levers: rai.levers,
      },

      pai: {
        teamA: pai.home,
        teamB: pai.away,
      },

      surprise,
    };
  })
);

  console.log(
    "DEBUG 8 MATCHES",
    matches.length
  );

  console.log(
    "DEBUG 9 FIRST MATCH",
    JSON.stringify(matches[0], null, 2)
  );

  const topSurprises = matches
    .filter(
      (m) =>
        m.surprise.isSurprise &&
        m.surprise.score >= 1
    )
    .sort(
      (a, b) =>
        b.surprise.score -
        a.surprise.score
    )
    .slice(0, 5)
    .map((m) => ({
      matchup: m.matchup,
      raiEdge: `${m.rai.edge} (+${m.rai.value})`,
      logicalOutcome:
        m.surprise.logicalOutcome,
      score: m.surprise.score,
      level:
        m.surprise.level as
          | "MINOR"
          | "MODERATE"
          | "MAJOR",
    }));

  console.log(
    "DEBUG 10 TOP SURPRISES",
    topSurprises.length
  );

  console.log(
    "DEBUG 11 RETURN"
  );

  return {
    updatedAt:
      new Date().toISOString(),
    matches,
    topSurprises,
  };
}
