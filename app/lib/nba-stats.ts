// Récupère les stats détaillées d'un match depuis ESPN
export async function getNBAGameStats(gameId: string) {
  try {
    const response = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${gameId}`,
      { next: { revalidate: 300 } }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const boxscore = data.boxscore;
    
    if (!boxscore) return null;
    
    const homeTeam = boxscore.teams[0];
    const awayTeam = boxscore.teams[1];
    
    return {
      home: {
        fg_pct: parseFloat(homeTeam.statistics.find((s: any) => s.name === 'fieldGoalPct')?.displayValue || '0'),
        three_pct: parseFloat(homeTeam.statistics.find((s: any) => s.name === 'threePointPct')?.displayValue || '0'),
        ft_pct: parseFloat(homeTeam.statistics.find((s: any) => s.name === 'freeThrowPct')?.displayValue || '0'),
        rebounds: parseInt(homeTeam.statistics.find((s: any) => s.name === 'totalRebounds')?.displayValue || '0'),
        assists: parseInt(homeTeam.statistics.find((s: any) => s.name === 'assists')?.displayValue || '0'),
        turnovers: parseInt(homeTeam.statistics.find((s: any) => s.name === 'turnovers')?.displayValue || '0'),
        blocks: parseInt(homeTeam.statistics.find((s: any) => s.name === 'blocks')?.displayValue || '0'),
        steals: parseInt(homeTeam.statistics.find((s: any) => s.name === 'steals')?.displayValue || '0')
      },
      away: {
        fg_pct: parseFloat(awayTeam.statistics.find((s: any) => s.name === 'fieldGoalPct')?.displayValue || '0'),
        three_pct: parseFloat(awayTeam.statistics.find((s: any) => s.name === 'threePointPct')?.displayValue || '0'),
        ft_pct: parseFloat(awayTeam.statistics.find((s: any) => s.name === 'freeThrowPct')?.displayValue || '0'),
        rebounds: parseInt(awayTeam.statistics.find((s: any) => s.name === 'totalRebounds')?.displayValue || '0'),
        assists: parseInt(awayTeam.statistics.find((s: any) => s.name === 'assists')?.displayValue || '0'),
        turnovers: parseInt(awayTeam.statistics.find((s: any) => s.name === 'turnovers')?.displayValue || '0'),
        blocks: parseInt(awayTeam.statistics.find((s: any) => s.name === 'blocks')?.displayValue || '0'),
        steals: parseInt(awayTeam.statistics.find((s: any) => s.name === 'steals')?.displayValue || '0')
      }
    };
  } catch (error) {
    console.error('ESPN stats error:', error);
    return null;
  }
}
