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

function computePAI(g: NormalizedGame) {
  const ms = clamp(
    margin(g) / 8,
    -3,
    3
  );

  const off = r2(ms);
  const shot = r2(ms * 0.7);
  const def = r2(ms * 0.85);

  return {
    home: {
      name: g.home.name,
      levers: [
        {
          label: "Offensive execution",
          value: off,
        },
        {
          label: "Shot conversion",
          value: shot,
        },
        {
          label: "Defensive resistance",
          value: def,
        },
      ],
    },

    away: {
      name: g.away.name,
      levers: [
        {
          label: "Offensive execution",
          value: -off,
        },
        {
          label: "Shot conversion",
          value: -shot,
        },
        {
          label: "Defensive resistance",
          value: -def,
        },
      ],
    },

    intensityAbs: r2(
      (
        Math.abs(off) +
        Math.abs(shot) +
        Math.abs(def)
      ) / 3
    ),
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
  pai: ReturnType<typeof computePAI>
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
  const games = await getSoccerGames(
    "soccer/fifa.world"
  );
console.log("BEFORE MATCH STATS");

if (games.length > 0) {
  try {
    console.log(
      "TEST EVENT ID",
      games[0].id
    );

    const stats =
      await getSoccerMatchStats(
        "soccer/fifa.world",
        games[0].id
      );

    console.log(
      "MATCH SUMMARY KEYS",
      Object.keys(stats)
    );

    console.log(
      "MATCH STATS FETCHED"
    );
  } catch (e) {
    console.error(
      "MATCH STATS ERROR",
      e
    );
  }
}

console.log("AFTER MATCH STATS");

console.log(
  "WORLD CUP GAMES",
  games.map((g) => ({
    home: g.home.name,
    away: g.away.name,
    date: g.dateUtc,
    status: g.status,
  }))
);

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
  const matches: FAIRMatch[] =
    finals.map((g) => {
      const rai = computeRAI(g);
      const pai = computePAI(g);
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
    });

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

return {
  updatedAt:
    new Date().toISOString(),
  matches,
  topSurprises,
};
}
