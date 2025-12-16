export type Lever = {
  lever: string;
  contribution: number;
  rationale: string;
};

export type LeverWithStatus = Lever & {
  status: "stronger_than_expected" | "weaker_than_expected" | "as_expected" | "NEW";
};

export function computeLeverDelta(
  expected: Lever[],
  observed: Lever[]
): LeverWithStatus[] {
  const expectedMap = new Map(
    expected.map(l => [l.lever, l.contribution])
  );

  return observed.map(l => {
    if (!expectedMap.has(l.lever)) {
      return {
        ...l,
        status: "NEW"
      };
    }

    const expectedValue = expectedMap.get(l.lever)!;
    const diff = l.contribution - expectedValue;

    let status: LeverWithStatus["status"] = "as_expected";

    if (diff >= 5) status = "stronger_than_expected";
    else if (diff <= -5) status = "weaker_than_expected";

    return {
      ...l,
      status
    };
  });
}
