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
  Argentina: 1877.27,
  Spain: 1874.71,
  France: 1870.70,
  England: 1828.02,
  Portugal: 1767.85,
  Brazil: 1765.34,
  Morocco: 1755.62,
  Netherlands: 1753.57,
  Belgium: 1742.24,
  Germany: 1735.77,

  Croatia: 1714.87,
  Mexico: 1700.98,
  Colombia: 1698.35,
  USA: 1688.53,
  "United States": 1688.53,
  Senegal: 1684.07,
  Uruguay: 1673.07,
  Japan: 1661.58,
  Switzerland: 1640.92,
  "IR Iran": 1619.58,
  "Korea Republic": 1612.55,
  "South Korea": 1612.55,
  Australia: 1605.61,
  Ecuador: 1598.52,
  Austria: 1597.40,
  Türkiye: 1579.47,
  Algeria: 1571.03,
  Egypt: 1562.37,
  Norway: 1557.44,
  Canada: 1551.50,
  "Côte d'Ivoire": 1540.87,
  "Ivory Coast": 1540.87,
  Panama: 1539.16,
  Scotland: 1518.77,
  Sweden: 1509.79,
  Paraguay: 1488.05,
  Czechia: 1484.82,
  Tunisia: 1476.41,
  "Congo DR": 1474.43,
  Qatar: 1459.45,
  Uzbekistan: 1458.73,
  Iraq: 1446.28,
  "Saudi Arabia": 1423.88,
  "South Africa": 1414.88,
  "Bosnia and Herzegovina": 1395.19,
  "Bosnia-Herzegovina": 1395.19,
  Jordan: 1387.74,
  "Cape Verde": 1371.11,
  "Cabo Verde": 1371.11,
  Ghana: 1346.88,
  Curaçao: 1294.77,
  Haiti: 1277.67,
  "New Zealand": 1275.58
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
