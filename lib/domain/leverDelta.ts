export type LeverStatus = "as_expected" | "stronger" | "weaker" | "NEW";

export interface LeverWithImpact {
  lever: string;
  contribution: number;
  rationale: string;
}

export interface LeverWithStatus extends LeverWithImpact {
  status: LeverStatus;
  delta: number; // observed - expected
}

export function computeLeverDelta(
  expectedLevers: LeverWithImpact[],
  observedLevers: LeverWithImpact[],
  threshold = 3 // small neutral zone
): LeverWithStatus[] {
  const expectedMap = new Map(expectedLevers.map(l => [l.lever, l]));

  return observedLevers.map(obs => {
    const exp = expectedMap.get(obs.lever);

    if (!exp) {
      return { ...obs, status: "NEW", delta: 0 };
    }

    const delta = obs.contribution - exp.contribution;

    let status: LeverStatus = "as_expected";
    if (delta > threshold) status = "stronger";
    else if (delta < -threshold) status = "weaker";

    return { ...obs, status, delta };
  });
}
