bash

head -150 /home/claude/thefairview-v2/app/lib/espn-mapper.ts
Output

// Map ESPN public stats to FAIR inputs (performance, fatigue, risk, morale)

export interface ESPNTeamStats {
  // Shooting
  field_goal_pct: number;      // 0-100
  three_point_pct: number;     // 0-100
  free_throw_pct: number;      // 0-100
  
  // Ball movement
  assists: number;
  turnovers: number;
  
  // Rebounding
  rebounds_offensive: number;
  rebounds_defensive: number;
  rebounds_total: number;
  
  // Defense
  steals: number;
  blocks: number;
  
  // Pace & efficiency
  pace?: number;
  offensive_rating?: number;
  defensive_rating?: number;
  
  // Rest & schedule
  days_rest: number;
  is_back_to_back: boolean;
  
  // Injuries
  injury_count: number;
  minutes_played_avg: number;
  
  // Morale indicators
  win_streak: number;           // positive = wins, negative = losses
  is_home: boolean;
  last_5_wins: number;          // 0-5
}

export interface FairInputs {
  performance: number;
  fatigue: number;
  risk: number;
  morale: number;
}

/**
 * Map ESPN stats to FAIR Performance (0-100)
 * Based on shooting, assists, rebounds
 */
function mapPerformance(stats: ESPNTeamStats): number {
  // Shooting efficiency (40% weight)
  const shooting = (
    stats.field_goal_pct * 0.5 +
    stats.three_point_pct * 0.3 +
    stats.free_throw_pct * 0.2
  ) * 0.4;
  
  // Ball movement (30% weight) - assists/turnovers ratio normalized
  const assist_to_ratio = stats.turnovers > 0 
    ? stats.assists / stats.turnovers 
    : stats.assists;
  const ball_movement = Math.min(100, assist_to_ratio * 50) * 0.3;
  
  // Rebounding (30% weight) - normalized to 50 rebounds = 100%
  const rebounding = Math.min(100, (stats.rebounds_total / 50) * 100) * 0.3;
  
  const performance = shooting + ball_movement + rebounding;
  return Math.min(100, Math.max(0, performance));
}

/**
 * Map ESPN stats to FAIR Fatigue (0-100)
 * Higher = more fatigued
 */
function mapFatigue(stats: ESPNTeamStats): number {
  // Days rest impact (60% weight)
  let rest_score = 0;
  if (stats.days_rest === 0) rest_score = 100;        // back-to-back
  else if (stats.days_rest === 1) rest_score = 60;    // 1 day rest
  else if (stats.days_rest === 2) rest_score = 30;    // 2 days rest
  else rest_score = 10;                                // 3+ days rest
  
  const rest_factor = rest_score * 0.6;
  
  // Back-to-back penalty (40% weight)
  const b2b_penalty = stats.is_back_to_back ? 100 : 0;
  const b2b_factor = b2b_penalty * 0.4;
  
  const fatigue = rest_factor + b2b_factor;
  return Math.min(100, Math.max(0, fatigue));
}

/**
 * Map ESPN stats to FAIR Risk (0-100)
 * Injury risk and overload
 */
function mapRisk(stats: ESPNTeamStats): number {
  // Injury count (60% weight)
  // 0 injuries = 0, 1 injury = 30, 2 = 60, 3+ = 100
  const injury_score = Math.min(100, stats.injury_count * 30);
  const injury_factor = injury_score * 0.6;
  
  // Minutes overload (40% weight)
  // NBA avg ~35min, 38+ is risky
  let minutes_score = 0;
  if (stats.minutes_played_avg > 38) minutes_score = 80;
  else if (stats.minutes_played_avg > 36) minutes_score = 50;
  else if (stats.minutes_played_avg > 34) minutes_score = 20;
  else minutes_score = 0;
  
  const minutes_factor = minutes_score * 0.4;
  
  const risk = injury_factor + minutes_factor;
  return Math.min(100, Math.max(0, risk));
}

/**
 * Map ESPN stats to FAIR Morale (0-100)
 * Higher = better morale
 */
function mapMorale(stats: ESPNTeamStats): number {
  // Win streak (50% weight)
  // +3 wins = 100, 0 = 60, -3 losses = 20
  let streak_score = 60 + (stats.win_streak * 13.3);
  streak_score = Math.min(100, Math.max(0, streak_score));
  const streak_factor = streak_score * 0.5;
  
  // Home advantage (30% weight)
  const home_bonus = stats.is_home ? 80 : 40;
  const home_factor = home_bonus * 0.3;
  
  // Recent form (20% weight) - last 5 games
  const form_score = (stats.last_5_wins / 5) * 100;
  const form_factor = form_score * 0.2;
  
  const morale = streak_factor + home_factor + form_factor;
  return Math.min(100, Math.max(0, morale));
}

/**
 * Main mapping function: ESPN stats → FAIR inputs
 */
export function mapESPNToFair(stats: ESPNTeamStats): FairInputs {
  return {
    performance: mapPerformance(stats),
    fatigue: mapFatigue(stats),
    risk: mapRisk(stats),
    morale: mapMorale(stats),tail -5 /home/claude/thefairview-v2/app/lib/espn-mapper.ts
Output

    fatigue: mapFatigue(stats),
    risk: mapRisk(stats),
    morale: mapMorale(stats),
  };
}
