export async function getRealGameStats(gameId: string) {
  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${gameId}`;
    const response = await fetch(url, { next: { revalidate: 300 } });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const boxscore = data.boxscore;
    
    if (!boxscore || !boxscore.teams) return null;
    
    // Extraire stats HOME team
    const homeTeam = boxscore.teams.find((t: any) => t.homeAway === 'home');
    const awayTeam = boxscore.teams.find((t: any) => t.homeAway === 'away');
    
    const getStatValue = (team: any, statName: string) => {
      const stat = team.statistics?.find((s: any) => s.name === statName);
      return parseFloat(stat?.displayValue || '0');
    };
    
    return {
      home: {
        fg_pct: getStatValue(homeTeam, 'fieldGoalPct'),
        three_pct: getStatValue(homeTeam, 'threePointPct'),
        ft_pct: getStatValue(homeTeam, 'freeThrowPct'),
        assists: getStatValue(homeTeam, 'assists'),
        turnovers: getStatValue(homeTeam, 'turnovers'),
        rebounds: getStatValue(homeTeam, 'totalRebounds'),
        steals: getStatValue(homeTeam, 'steals'),
        blocks: getStatValue(homeTeam, 'blocks')
      },
      away: {
        fg_pct: getStatValue(awayTeam, 'fieldGoalPct'),
        three_pct: getStatValue(awayTeam, 'threePointPct'),
        ft_pct: getStatValue(awayTeam, 'freeThrowPct'),
        assists: getStatValue(awayTeam, 'assists'),
        turnovers: getStatValue(awayTeam, 'turnovers'),
        rebounds: getStatValue(awayTeam, 'totalRebounds'),
        steals: getStatValue(awayTeam, 'steals'),
        blocks: getStatValue(awayTeam, 'blocks')
      }
    };
  } catch (error) {
    console.error('ESPN API error:', error);
    return null;
  }
}
