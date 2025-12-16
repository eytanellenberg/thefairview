type Side = "home" | "away";

export function calculatePAI(params: {
  side: Side;
  scored: number;
  conceded: number;
}) {
  const margin = params.scored - params.conceded;

  let score = 50;
  const factors: { factor: string; contribution: number }[] = [];

  // Win / loss
  if (margin > 0) {
    score += 12;
    factors.push({ factor: "Win outcome", contribution: 0.24 });
  } else {
    score -= 10;
    factors.push({ factor: "Loss outcome", contribution: -0.2 });
  }

  // Margin
  if (Math.abs(margin) >= 10) {
    score += margin > 0 ? 6 : -6;
    factors.push({
      factor: margin > 0 ? "Large positive margin" : "Large negative margin",
      contribution: margin > 0 ? 0.12 : -0.12
    });
  }

  // Away performance bonus
  if (params.side === "away" && margin > 0) {
    score += 4;
    factors.push({ factor: "Away win execution", contribution: 0.08 });
  }

  return {
    pai: Math.max(0, Math.min(100, Math.round(score))),
    margin,
    factors
  };
}
