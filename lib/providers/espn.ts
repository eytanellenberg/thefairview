/* ================= ESPN TYPES ================= */

export type ESPNCompetitor = {
  homeAway?: "home" | "away";
  type?: "home" | "away";
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

/* ================= NORMALIZED ================= */

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
  if (t?.completed || t?.name?.includes("FINAL") || t?.state === "post") return "FINAL";
  if (t?.state === "pre") return "SCHEDULED";
  if (t?.state === "in") return "IN_PROGRESS";
  return "UNKNOWN";
}

function pickTeams(ev: ESPNEvent) {
  const comps = ev.competitions?.[0];
  const cs = comps?.competitors || [];

  const homeC = cs.find(c => c.homeAway === "home" || c.type === "home");
  const awayC = cs.find(c => c.homeAway === "away" || c.type === "away");

  const homeScore = numScore(homeC?.score);
  const awayScore = numScore(awayC?.score);

  let winner: "HOME" | "AWAY" | null = null;
  if (homeC?.winner) winner = "HOME";
  if (awayC?.winner) winner = "AWAY";
  if (!winner && homeScore !== null && awayScore !== null) {
    if (homeScore > awayScore) winner = "HOME";
    if (awayScore > homeScore) winner = "AWAY";
  }

  return {
    home: {
      name: homeC?.team?.displayName || "Home",
      abbr: homeC?.team?.abbreviation,
      score: homeScore,
    },
    away: {
      name: awayC?.team?.displayName || "Away",
      abbr: awayC?.team?.abbreviation,
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
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  if (!res.ok) throw new Error("ESPN error");
  const json = await res.json();
  return json?.events || [];
}

function normalizeEvents(events: ESPNEvent[]): NormalizedGame[] {
  return events
    .map(ev => {
      const id = String(ev.id || "");
      const dateUtc = String(ev.date || ev.competitions?.[0]?.date || "");
      if (!id || !dateUtc) return null;

      const status = toStatus(ev);
      const { home, away, winner } = pickTeams(ev);

      return {
        id,
        dateUtc,
        status,
        home,
        away,
        winner,
      };
    })
    .filter(Boolean) as NormalizedGame[];
}

/* ================= NBA ================= */

/** NBA — derniers matchs FINAL sur plusieurs jours */
export async function getNBALastFinalGames(daysBack = 7): Promise<NormalizedGame[]> {
  const all: NormalizedGame[] = [];
  const today = new Date();

  for (let i = 0; i < daysBack; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10).replace(/-/g, "");

    const events = await fetchScoreboard("basketball/nba", { dates: dateStr });
    all.push(...normalizeEvents(events));
  }

  return all.filter(g => g.status === "FINAL");
}
