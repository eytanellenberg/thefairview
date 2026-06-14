import { getSoccerGames, NormalizedGame } from "@/lib/providers/espn";

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

/* ================= FIFA RANKINGS ================= */

const FIFA_RANKINGS: Record<string, number> = {
Croatia: 1700,
"United States": 1700,
Switzerland: 1680,
Mexico: 1680,
Uruguay: 1670,
Colombia: 1660,
Canada: 1650,
Japan: 1630,
Senegal: 1620,
Scotland: 1610,
Ecuador: 1610,
"South Korea": 1580,
Australia: 1560,
"Türkiye": 1550,
Algeria: 1520,
Czechia: 1520,
Egypt: 1500,
Paraguay: 1480,
"Bosnia-Herzegovina": 1470,
Qatar: 1450,
"South Africa": 1450,
"Cape Verde": 1420,
Haiti: 1400,
"Congo DR": 1400,
"Curaçao": 1380,
Jordan: 1350,
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

  const rankingEdge = clamp(
    diff / 100,
    -3,
    3
  );

  const edgeTeam =
    diff >= 0
      ? g.home.name
      : g.away.name;

  return {
    edgeTeam,
    valueAbs: r2(Math.abs(rankingEdge)),
levers: [
  {
    label: "FIFA ranking differential",
    value: r2(rankingEdge),
  },
  {
    label: "Recent form",
    value: 0,
  },
  {
    label: "Tournament experience",
    value: 0,
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

  if (!w) {
    return {
      isSurprise: false,
      winner: "—",
      raiFavored: rai.edgeTeam,
      logicalOutcome: 0,
      score: 0,
      level: "NONE",
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

  const score = r2(
    rai.valueAbs *
      pai.intensityAbs
  );

  return {
    isSurprise: true,
    winner: w,
    raiFavored: rai.edgeTeam,
    logicalOutcome,
    score,
    level: level(score),
  };
}

/* ================= MAIN ================= */

export async function computeWorldCup2026AutoSnapshot(): Promise<WorldCup2026AutoSnapshot> {
  const games = await getSoccerGames(
    "soccer/fifa.world"
  );

  const finals = games
    .filter(
      (g) => g.status === "FINAL"
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
        m.surprise.isSurprise
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
