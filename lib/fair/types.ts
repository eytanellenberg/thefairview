export type FAIRSnapshot = {
  sport: string;
  updatedAt: string;
  matchups: FAIRMatchup[];
};

export type FAIRMatchup = {
  teams: {
    A: string;
    B: string;
  };

  nextGameUtc: string;

  pregameRAI: {
    delta: number;
    favoredTeam: string;
    levers: {
      name: string;
      value: number;
    }[];
  };

  postgamePAI: {
    note: string;
    A: FAIRPAI;
    B: FAIRPAI;
  };
};

export type FAIRPAI = {
  team: string;
  lastScore: string;
  result: "Win" | "Loss";
  margin: "Close" | "Comfortable" | "Blowout";
  execution: "Above baseline" | "Below baseline";
};
