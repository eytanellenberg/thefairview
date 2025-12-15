// Map ESPN public stats to FAIR inputs (performance, fatigue, risk, morale)

export interface ESPNTeamStats {
  field_goal_pct: number;
  three_point_pct: number;
  free_throw_pct: number;
  assists: number;
  turnovers: number;
  rebounds_offensive: number;
  rebounds_defensive: number;
  rebounds_total: number;
  steals: number;
  blocks: number;
  pace?: number;
  offensive_rating?: number;
  defensive_rating?: number;
  days_rest: number;
  is_back_to_back: boolean;
  injury_count: number;
  minutes_played_avg: number;
  win_streak: number;
  is_home: boolean;
  last_5_wins: number;
}

export interface FairInputs {
  performance: number;
  fatigue: number;
  risk: number;
  morale: number;
}

function mapPerformance(stats: ESPNTeamStats): number {
  const shooting = (
    stats.field_goal_pct * 0.5 +
    stats.three_point_pct * 0.3 +
    stats.free_throw_pct * 0.2
  ) * 0.4;
  
  const assist_to_ratio = stats.turnovers > 0 
    ? stats.assists / stats.turnovers 
    : stats.assists;
  const ball_movement = Math.min(100, assist_to_ratio * 50) * 0.3;
  
  const rebounding = Math.min(100, (stats.rebounds_total / 50) * 100) * 0.3;
  
  const performance = shooting + ball_movement + rebounding;
  return Math.min(100, Math.max(0, performance));
}

function mapFatigue(stats: ESPNTeamStats): number {
  let rest_score = 0;
  if (stats.days_rest === 0) rest_score = 100;
  else if (stats.days_rest === 1) rest_score = 60;
  else if (stats.days_rest === 2) rest_score = 30;
  else rest_score = 10;
  
  const rest_factor = rest_score * 0.6;
  const b2b_penalty = stats.is_back_to_back ? 100 : 0;
  const b2b_factor = b2b_penalty * 0.4;
  
  const fatigue = rest_factor + b2b_factor;
  return Math.min(100, Math.max(0, fatigue));
}

function mapRisk(stats: ESPNTeamStats): number {
  const injury_score = Math.min(100, stats.injury_count * 30);
  const injury_factor = injury_score * 0.6;
  
  let minutes_score = 0;
  if (stats.minutes_played_avg > 38) minutes_score = 80;
  else if (stats.minutes_played_avg > 36) minutes_score = 50;
  else if (stats.minutes_played_avg > 34) minutes_score = 20;
  else minutes_score = 0;
  
  const minutes_factor = minutes_score * 0.4;
  
  const risk = injury_factor + minutes_factor;
  return Math.min(100, Math.max(0, risk));
}

function mapMorale(stats: ESPNTeamStats): number {
  let streak_score = 60 + (stats.win_streak * 13.3);
  streak_score = Math.min(100, Math.max(0, streak_score));
  const streak_factor = streak_score * 0.5;
  
  const home_bonus = stats.is_home ? 80 : 40;
  const home_factor = home_bonus * 0.3;
  
  const form_score = (stats.last_5_wins / 5) * 100;
  const form_factor = form_score * 0.2;
  
  const morale = streak_factor + home_factor + form_factor;
  return Math.min(100, Math.max(0, morale));
}

export function mapESPNToFair(stats: ESPNTeamStats): FairInputs {
  return {
    performance: mapPerformance(stats),
    fatigue: mapFatigue(stats),
    risk: mapRisk(stats),
    morale: mapMorale(stats),
  };
}
