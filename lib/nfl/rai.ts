export function computeNFLRAI({
  form3,
  restCategory,
  isHome,
}: {
  form3: number;
  restCategory: number; // bye=+2 | normal=0 | short=-1.5
  isHome: boolean;
}) {
  const total =
    0.6 * form3 +
    1.0 * restCategory +
    (isHome ? 1.0 : -1.0);

  return {
    total,
    levers: [
      { name: "Recent form (net pts/game)", value: 0.6 * form3 },
      { name: "Rest advantage", value: restCategory },
      { name: "Home/Away context", value: isHome ? 1.0 : -1.0 },
    ],
  };
}
