export function computeSoccerRAI({
  goalDiff,
  restDays,
  isHome,
}: {
  goalDiff: number;
  restDays: number;
  isHome: boolean;
}) {
  const total =
    1.2 * goalDiff +
    0.4 * restDays +
    (isHome ? 0.6 : -0.6);

  return {
    total,
    levers: [
      { name: "Recent form (goal diff/game)", value: 1.2 * goalDiff },
      { name: "Rest advantage", value: 0.4 * restDays },
      { name: "Home/Away context", value: isHome ? 0.6 : -0.6 },
    ],
  };
}
