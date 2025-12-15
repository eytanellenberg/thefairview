// FAIR Core Engine - Original Formula from simul.R
// lin_pred = -4 + 0.06*perf_mean + -0.05*fatigue_mean + -0.04*risk_mean + 0.05*moral_mean
// prob_win = plogis(lin_pred)
// rai_score = prob_win * 100

export interface FairInputs {
  performance: number;  // 0-100
  fatigue: number;      // 0-100
  risk: number;         // 0-100
  morale: number;       // 0-100
}

export interface FairOutput {
  rai_score: number;    // 0-100
  confidence: number;   // 0-100
  top_levers: Array<{
    name: string;
    value: number;
    impact: string;
    explanation: string;
  }>;
}

// Logistic function (plogis equivalent)
function plogis(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

// Calculate RAI using original FAIR formula
export function calculateRAI(inputs: FairInputs): FairOutput {
  const { performance, fatigue, risk, morale } = inputs;
  
  // Original formula from simul.R
  const lin_pred = -4 + 
    0.06 * performance + 
    -0.05 * fatigue + 
    -0.04 * risk + 
    0.05 * morale;
  
  const prob_win = plogis(lin_pred);
  const rai_score = prob_win * 100;
  
  // Calculate lever impacts (contribution to linear predictor)
  const perf_impact = 0.06 * performance;
  const fatigue_impact = -0.05 * fatigue;
  const risk_impact = -0.04 * risk;
  const morale_impact = 0.05 * morale;
  
  // Rank levers by absolute impact
  const levers = [
    {
      name: 'Performance',
      value: performance,
      raw_impact: perf_impact,
      coefficient: 0.06,
    },
    {
      name: 'Fatigue',
      value: fatigue,
      raw_impact: fatigue_impact,
      coefficient: -0.05,
    },
    {
      name: 'Risk',
      value: risk,
      raw_impact: risk_impact,
      coefficient: -0.04,
    },
    {
      name: 'Morale',
      value: morale,
      raw_impact: morale_impact,
      coefficient: 0.05,
    },
  ].sort((a, b) => Math.abs(b.raw_impact) - Math.abs(a.raw_impact));
  
  // Top 3 levers with simple explanations
  const top_levers = levers.slice(0, 3).map(lever => {
    const impact_sign = lever.raw_impact > 0 ? 'positive' : 'negative';
    const impact_magnitude = Math.abs(lever.raw_impact);
    
    let explanation = '';
    if (lever.name === 'Performance') {
      explanation = `L'équipe a un niveau de performance de ${Math.round(lever.value)}% basé sur ses stats récentes (tirs, passes, rebonds).`;
    } else if (lever.name === 'Fatigue') {
      explanation = `Le niveau de fatigue est de ${Math.round(lever.value)}% selon le nombre de jours de repos et les matchs consécutifs.`;
    } else if (lever.name === 'Risk') {
      explanation = `Le risque (blessures, surcharge) est évalué à ${Math.round(lever.value)}% d'après les rapports médicaux.`;
    } else {
      explanation = `Le moral de l'équipe est de ${Math.round(lever.value)}% selon la série de victoires/défaites et le domicile/extérieur.`;
    }
    
    return {
      name: lever.name,
      value: Math.round(lever.value),
      impact: impact_sign,
      explanation,
    };
  });
  
  // Confidence: 65% for public data (no proprietary inputs)
  const confidence = 65;
  
  return {
    rai_score: Math.round(rai_score),
    confidence,
    top_levers,
  };
}

// Calculate PAI (post-match) - same formula with actual match data
export function calculatePAI(inputs: FairInputs): FairOutput {
  return calculateRAI(inputs);
}
