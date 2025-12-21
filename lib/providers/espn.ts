export type ESPNCompetitor = {
  homeAway?: "home" | "away";
  team?: {
    displayName?: string;
    shortDisplayName?: string;
    abbreviation?: string;
  };
  score?: string;
  winner?: boolean;
};

export type ESPNCompetition = {
  date?: string;
  competitors?: ESPNCompetitor[];
  status?: {
    type?: {
      name?: string;
      state?: string;
      completed?: boolean;
    };
  };
};

export type ESPNEvent = {
  id?: string;
  date?: string;
  competitions?: ESPNCompetition[];
};

/* ================= NORMALIZED TYPES ================= */

export type NormalizedTeam = {
  name: string;
  abbr?: string;
  score: number | null;
};

export type NormalizedGame = {
  id: string;
  dateUtc: string;
  status: "FINAL" | "SCHEDULED" | "IN_PROGRESS" | "UNKNOWN";
  home: NormalizedTeam;
  away: NormalizedTeam;
  winner: "HOME" | "AWAY" | null;
};

/* ================= HELPERS ================= */

function numScore(s?: string): number | null {
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function toStatus(ev: ESPNEvent): NormalizedGame["status"] {
  const t = ev.competitions?.[0]?.status?.type;
  if (t?.completed || t?.name?.toUpperCase().includes("FINAL")) return "FINAL";
  if (t?.state === "pre") return "SCHEDULED";
  if (t?.state === "in") return "IN_PROGRESS";
  return "UNKNOWN";
}

function pickTeams(ev: ESPNEvent) {
  const competitors = ev.competitions?.[0]?.competitors || [];

  const home = competitors.find((c) => c.homeAway === "home");
  const away = competitors.find((c) => c.homeAway === "away");

  const homeScore = numScore(home?.score);
  const awayScore = numScore(away?.score);

  let winner: "HOME" | "AWAY" | null = null;
  if (home?.winner) winner = "HOME";
  if (away?.winner) winner = "AWAY";
  if (!winner && homeScore !== null && awayScore !== null) {
    if (homeScore > awayScore) winner = "HOME";
    if (awayScore > homeScore) winner = "AWAY";
  }

  return {
    home: {
      name: home?.team?.displayName || "Home",
      abbr: home?.team?.abbreviation,
      score: homeScore,
    },
    away: {
      name: away?.team?.displayName || "Away",
      abbr: away?.team?.abbreviation,
      score: awayScore,
    },
    winner,
  };
}

async function fetchScoreboard(
  league: string,
  params: Record<string, string> = {}
): Promise<ESPNEvent[]> {
  const url = new URL(
    `https://site.api.espn.com/apis/site/v2/sports/${league}/scoreboard`
  );
  Object.entries(params).forEach(([k, v]) =>
    url.searchParams.set(k, v)
  );

  const res = await fetch(url.toString(), { cache: "no-store" });
  const json = await res.json();
  return (json?.events || []) as ESPNEvent[];
}

function normalize(events: ESPNEvent[]): NormalizedGame[] {
  return events
    .map((ev) => {
      if (!ev.id) return null;

      const status = toStatus(ev);
      const dateUtc = ev.date || ev.competitions?.[0]?.date;
      if (!dateUtc) return null;

      const { home, away, winner } = pickTeams(ev);

      return {
        id: String(ev.id),
        dateUtc,
        status,
        home,
        away,
        winner,
      };
    })
    .filter(Boolean) as NormalizedGame[];
}

/* ================= PUBLIC API ================= */

/** NBA — LOOKBACK 7 JOURS (CRUCIAL) */
export async function getNBAGames(): Promise<NormalizedGame[]> {
  const all: NormalizedGame[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const ymd = d.toISOString().slice(0, 10).replace(/-/g, "");

    const events = await fetchScoreboard("basketball/nba", { dates: ymd });
    all.push(...normalize(events));
  }

  // dédup
  const map = new Map<string, NormalizedGame>();
  all.forEach((g) => map.set(g.id, g));

  return [...map.values()];
}
