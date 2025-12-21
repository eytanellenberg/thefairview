import { getNBAGames } from "@/lib/providers/espn";

/* ================= CONSTANTS ================= */

const SCORE_NORM = 10;
const MAX_RAI = 3;
const MAX_PAI = 2.5;

/* ================= TYPES ================= */

type Lever = { label: string; value: number };

type TeamPAI = { name: string; levers: Lever[] };

type FAIRMatch = {
  matchup: string;
  finalScore: string;
  rai: {
    edge: string;
    value: number;
    levers: Lever[];
  };
  pai: {
    teamA: TeamPAI;
    teamB: TeamPAI;
  };
};

export type NBAAutoSnapshot = {
  updatedAt: string;
  matches: FAIRMatch[];
};

/* ================= HELPERS ================= */

const clamp = (v: number, max: number) =>
  Math.max(-max, Math.min(max, v));

const isFinal = (e: any) =>
  e?.competitions?.[0]?.status?.type?.state === "post";

/* ================= CORE ================= */

export async function computeNBAAutoSnapshot(): Promise<NBAAutoSnapshot> {
  const events = await getNBAGames();

  const matches: FAIRMatch[] = events
    .filter(isFinal)
    .map((event: any) => {
      const comp = event.competitions[0];
      const homeRaw = comp.competitors.find((c: any) => c.homeAway === "home");
      const awayRaw = comp.competitors.find((c: any) => c.homeAway === "away");

      const homeScore = Number(homeRaw.score);
      const awayScore = Number(awayRaw.score);
      const diff = homeScore - awayScore;

      /* ---------- RAI ---------- */

      const homeCourt = 0.6;
      const form = clamp(diff / SCORE_NORM, 1.5);
      const recordProxy = clamp(diff / 20, 1);

      const raiRaw = homeCourt + form + recordProxy;
      const raiValue = clamp(raiRaw, MAX_RAI);

      /* ---------- PAI ---------- */

      const off = clamp(diff / SCORE_NORM, MAX_PAI);
      const shot = clamp(diff / (SCORE_NORM * 1.4), MAX_PAI);
      const def = clamp(diff / (SCORE_NORM * 1.2), MAX_PAI);

      return {
        matchup: `${homeRaw.team.displayName} vs ${awayRaw.team.displayName}`,
        finalScore: `${homeScore} – ${awayScore}`,

        rai: {
          edge: raiValue >= 0 ? homeRaw.team.displayName : awayRaw.team.displayName,
          value: Math.abs(Number(raiValue.toFixed(2))),
          levers: [
            { label: "Home-court context", value: Number(homeCourt.toFixed(2)) },
            { label: "Recent scoring form", value: Number(form.toFixed(2)) },
            { label: "Record proxy", value: Number(recordProxy.toFixed(2)) },
          ],
        },

        pai: {
          teamA: {
            name: homeRaw.team.displayName,
            levers: [
              { label: "Offensive execution", value: Number(off.toFixed(2)) },
              { label: "Shot conversion", value: Number(shot.toFixed(2)) },
              { label: "Defensive resistance", value: Number(def.toFixed(2)) },
            ],
          },
          teamB: {
            name: awayRaw.team.displayName,
            levers: [
              { label: "Offensive execution", value: Number((-off).toFixed(2)) },
              { label: "Shot conversion", value: Number((-shot).toFixed(2)) },
              { label: "Defensive resistance", value: Number((-def).toFixed(2)) },
            ],
          },
        },
      };
    });

  return {
    updatedAt: new Date().toISOString(),
    matches,
  };
}
