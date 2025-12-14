export async function getNBASchedule() {
  const matches: any[] = [];
  
  try {
    // Récupérer les 7 derniers jours + 7 prochains jours
    for (let i = -7; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
      
      const response = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${dateStr}`,
        { next: { revalidate: 180 } }
      );
      
      if (response.ok) {
        const data = await response.json();
        const events = data.events || [];
        
        events.forEach((event: any) => {
          const competition = event.competitions[0];
          const homeTeam = competition.competitors.find((c: any) => c.homeAway === 'home');
          const awayTeam = competition.competitors.find((c: any) => c.homeAway === 'away');
          
          matches.push({
            id: event.id,
            date: event.date.split('T')[0],
            time: event.date.split('T')[1]?.substring(0, 5) || '19:00',
            homeTeam: homeTeam.team.abbreviation,
            awayTeam: awayTeam.team.abbreviation,
            homeTeamName: homeTeam.team.displayName,
            awayTeamName: awayTeam.team.displayName,
            homeScore: homeTeam.score ? parseInt(homeTeam.score) : null,
            awayScore: awayTeam.score ? parseInt(awayTeam.score) : null,
            status: event.status.type.completed ? 'completed' : 'upcoming',
            sport: 'NBA'
          });
        });
      }
    }
    
    console.log(`Loaded ${matches.length} real NBA games from ESPN`);
    return matches;
    
  } catch (error) {
    console.error('ESPN API error:', error);
    return [];
  }
}

export async function getNFLSchedule() {
  const matches: any[] = [];
  
  try {
    for (let i = -7; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
      
      const response = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${dateStr}`,
        { next: { revalidate: 180 } }
      );
      
      if (response.ok) {
        const data = await response.json();
        const events = data.events || [];
        
        events.forEach((event: any) => {
          const competition = event.competitions[0];
          const homeTeam = competition.competitors.find((c: any) => c.homeAway === 'home');
          const awayTeam = competition.competitors.find((c: any) => c.homeAway === 'away');
          
          matches.push({
            id: event.id,
            date: event.date.split('T')[0],
            homeTeam: homeTeam.team.abbreviation,
            awayTeam: awayTeam.team.abbreviation,
            homeTeamName: homeTeam.team.displayName,
            awayTeamName: awayTeam.team.displayName,
            homeScore: homeTeam.score ? parseInt(homeTeam.score) : null,
            awayScore: awayTeam.score ? parseInt(awayTeam.score) : null,
            status: event.status.type.completed ? 'completed' : 'upcoming',
            sport: 'NFL'
          });
        });
      }
    }
    
    return matches;
  } catch (error) {
    console.error('NFL API error:', error);
    return [];
  }
}

export async function getNHLSchedule() {
  const matches: any[] = [];
  
  try {
    for (let i = -7; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
      
      const response = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard?dates=${dateStr}`,
        { next: { revalidate: 180 } }
      );
      
      if (response.ok) {
        const data = await response.json();
        const events = data.events || [];
        
        events.forEach((event: any) => {
          const competition = event.competitions[0];
          const homeTeam = competition.competitors.find((c: any) => c.homeAway === 'home');
          const awayTeam = competition.competitors.find((c: any) => c.homeAway === 'away');
          
          matches.push({
            id: event.id,
            date: event.date.split('T')[0],
            homeTeam: homeTeam.team.abbreviation,
            awayTeam: awayTeam.team.abbreviation,
            homeTeamName: homeTeam.team.displayName,
            awayTeamName: awayTeam.team.displayName,
            homeScore: homeTeam.score ? parseInt(homeTeam.score) : null,
            awayScore: awayTeam.score ? parseInt(awayTeam.score) : null,
            status: event.status.type.completed ? 'completed' : 'upcoming',
            sport: 'NHL'
          });
        });
      }
    }
    
    return matches;
  } catch (error) {
    console.error('NHL API error:', error);
    return [];
  }
}

export async function getMLBSchedule() {
  return [];
}

export async function getSoccerSchedule() {
  const matches: any[] = [];
  
  try {
    for (let i = -7; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
      
      const response = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard?dates=${dateStr}`,
        { next: { revalidate: 180 } }
      );
      
      if (response.ok) {
        const data = await response.json();
        const events = data.events || [];
        
        events.forEach((event: any) => {
          const competition = event.competitions[0];
          const homeTeam = competition.competitors.find((c: any) => c.homeAway === 'home');
          const awayTeam = competition.competitors.find((c: any) => c.homeAway === 'away');
          
          matches.push({
            id: event.id,
            date: event.date.split('T')[0],
            homeTeam: homeTeam.team.abbreviation,
            awayTeam: awayTeam.team.abbreviation,
            homeTeamName: homeTeam.team.displayName,
            awayTeamName: awayTeam.team.displayName,
            homeScore: homeTeam.score ? parseInt(homeTeam.score) : null,
            awayScore: awayTeam.score ? parseInt(awayTeam.score) : null,
            status: event.status.type.completed ? 'completed' : 'upcoming',
            sport: 'SOCCER'
          });
        });
      }
    }
    
    return matches;
  } catch (error) {
    console.error('Soccer API error:', error);
    return [];
  }
}
