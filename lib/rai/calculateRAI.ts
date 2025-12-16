import { daysBetween } from "./utils";

type TeamSide = "home" | "away";

export function calculateRAI(params: {
  side: TeamSide;
  daysRest: number;
  seasonStarted: boolean;
}) {
  let score = 50;
  const factors: { factor: string; contribution: number }[] = [];

  // Home advantage
  if (params.side === "home") {
    score += 6;
    factors.push({ factor: "Home advantage", contribution: 0.12 });
  } else {
    score -= 4;
    factors.push({ factor: "Away game", contribution: -0.08 });
  }

  // Rest
  if (params.daysRest >= 2) {
    score += 4;
    factors.push({ factor: "Rest advantage", contribution: 0.08 });
  } else if (params.daysRest <= 0) {
    score -= 3;
    factors.push({ factor: "Back-to-back / low rest", contribution: -0.06 });
  }

  // Season start uncertainty
  if (!params.seasonStarted) {
    score -= 2;
    factors.push({ factor: "Season start uncertainty", contribution: -0.04 });
  }

  return {
    rai: Math.max(0, Math.min(100, Math.round(score))),
    factors
  };
}
