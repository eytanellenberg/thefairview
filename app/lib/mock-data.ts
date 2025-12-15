bash

cat /home/claude/thefairview-v2/app/lib/mock-data.ts
Output

// Mock ESPN data for testing without network access

export const MOCK_GAMES = [
  {
    id: '401704855',
    date: '2024-12-07T00:00:00Z',
    name: 'New York Knicks at Orlando Magic',
    shortName: 'NY @ ORL',
    competitions: [{
      id: '401704855',
      date: '2024-12-07T00:00:00Z',
      competitors: [
        {
          id: '24',
          team: {
            id: '24',
            name: 'Magic',
            abbreviation: 'ORL',
            displayName: 'Orlando Magic',
          },
          score: '100',
          homeAway: 'home',
          winner: false,
        },
        {
          id: '20',
          team: {
            id: '20',
            name: 'Knicks',
            abbreviation: 'NY',
            displayName: 'New York Knicks',
          },
          score: '106',
          homeAway: 'away',
          winner: true,
        },
      ],
      status: {
        type: {
          completed: true,
        },
      },
    }],
  },
  {
    id: '401704856',
    date: '2024-12-07T00:00:00Z',
    name: 'Toronto Raptors at Boston Celtics',
    shortName: 'TOR @ BOS',
    competitions: [{
      id: '401704856',
      date: '2024-12-07T00:00:00Z',
      competitors: [
        {
          id: '2',
          team: {
            id: '2',
            name: 'Celtics',
            abbreviation: 'BOS',
            displayName: 'Boston Celtics',
          },
          score: '121',
          homeAway: 'home',
          winner: true,
        },
        {
          id: '28',
          team: {
            id: '28',
            name: 'Raptors',
            abbreviation: 'TOR',
            displayName: 'Toronto Raptors',
          },
          score: '113',
          homeAway: 'away',
          winner: false,
        },
      ],
      status: {
        type: {
          completed: true,
        },
      },
    }],
  },
];

export const MOCK_GAME_DETAILS = {
  '401704855': {
    gameId: '401704855',
    homeTeam: {
      id: '24',
      name: 'Orlando Magic',
      score: 100,
      stats: [
        { name: 'Field Goal Percentage', displayValue: '43.0%', value: 43.0 },
        { name: 'Three Point Field Goal Percentage', displayValue: '35.7%', value: 35.7 },
        { name: 'Free Throw Percentage', displayValue: '78.6%', value: 78.6 },
        { name: 'Assists', displayValue: '22', value: 22 },
        { name: 'Turnovers', displayValue: '14', value: 14 },
        { name: 'Offensive Rebounds', displayValue: '9', value: 9 },
        { name: 'Defensive Rebounds', displayValue: '32', value: 32 },
        { name: 'Total Rebounds', displayValue: '41', value: 41 },
        { name: 'Steals', displayValue: '7', value: 7 },
        { name: 'Blocks', displayValue: '4', value: 4 },
      ],
    },
    awayTeam: {
      id: '20',
      name: 'New York Knicks',
      score: 106,
      stats: [
        { name: 'Field Goal Percentage', displayValue: '46.5%', value: 46.5 },
        { name: 'Three Point Field Goal Percentage', displayValue: '38.5%', value: 38.5 },
        { name: 'Free Throw Percentage', displayValue: '82.1%', value: 82.1 },
        { name: 'Assists', displayValue: '24', value: 24 },
        { name: 'Turnovers', displayValue: '11', value: 11 },
        { name: 'Offensive Rebounds', displayValue: '10', value: 10 },
        { name: 'Defensive Rebounds', displayValue: '35', value: 35 },
        { name: 'Total Rebounds', displayValue: '45', value: 45 },
        { name: 'Steals', displayValue: '8', value: 8 },
        { name: 'Blocks', displayValue: '5', value: 5 },
      ],
    },
    completed: true,
  },
  '401704856': {
    gameId: '401704856',
    homeTeam: {
      id: '2',
      name: 'Boston Celtics',
      score: 121,
      stats: [
        { name: 'Field Goal Percentage', displayValue: '48.8%', value: 48.8 },
        { name: 'Three Point Field Goal Percentage', displayValue: '41.2%', value: 41.2 },
        { name: 'Free Throw Percentage', displayValue: '85.0%', value: 85.0 },
        { name: 'Assists', displayValue: '27', value: 27 },
        { name: 'Turnovers', displayValue: '10', value: 10 },
        { name: 'Offensive Rebounds', displayValue: '8', value: 8 },
        { name: 'Defensive Rebounds', displayValue: '38', value: 38 },
        { name: 'Total Rebounds', displayValue: '46', value: 46 },
        { name: 'Steals', displayValue: '9', value: 9 },
        { name: 'Blocks', displayValue: '6', value: 6 },
      ],
    },
    awayTeam: {
      id: '28',
      name: 'Toronto Raptors',
      score: 113,
      stats: [
        { name: 'Field Goal Percentage', displayValue: '45.2%', value: 45.2 },
        { name: 'Three Point Field Goal Percentage', displayValue: '36.4%', value: 36.4 },
        { name: 'Free Throw Percentage', displayValue: '76.9%', value: 76.9 },
        { name: 'Assists', displayValue: '25', value: 25 },
        { name: 'Turnovers', displayValue: '13', value: 13 },
        { name: 'Offensive Rebounds', displayValue: '11', value: 11 },
        { name: 'Defensive Rebounds', displayValue: '33', value: 33 },
        { name: 'Total Rebounds', displayValue: '44', value: 44 },
        { name: 'Steals', displayValue: '6', value: 6 },
        { name: 'Blocks', displayValue: '3', value: 3 },
      ],
    },
    completed: true,
  },
};
