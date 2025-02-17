import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  teamData: any[] = [];
  constructor() {}

  setTeamData(data: any) {
    this.teamData = data;
  }

  getTeamData(numberOfGame: number) {
    const teamData = this.teamData.slice(0, numberOfGame);
    const sortPlayers = teamData.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return sortPlayers;
  }

  preparePlayerStatsGraphData(stats: string, numberOfPlayers: number, lineVal: number) {
    const players = this.getTeamData(numberOfPlayers);
    const key = this.getStatsKeyByStatsId(stats);
    const datasets = players.map((player: any) => {
      const values: Record<string, number> = {};
  
      key.keyArr.forEach((k: string) => {
        let value = player[k];
        if (typeof value === 'string') {
          value = parseFloat(value);
        }
        values[k] = value || 0;
      });
  
      const date = new Date(player.match_datetime);  
      const localDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' })); 
      const formattedDate = `${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;

      return {
        category: `${formattedDate}_${player?.opponent_tricode ?? ''}_${player?.match_datetime ?? ''}`,
        values,
      };
    });
  
    return datasets;
  }

  // ----------------- Stats Of NBA -----------------
  //====================================================================

  getStatsKeyByStatsId(statsId: string): { key: string; keyArr: string[] } {
    switch (statsId) {
      case 'MIN':
        return { key: 'minutes', keyArr: ['minutes'] };
      case 'PTS':
        return { key: 'points', keyArr: ['points'] };
      case 'TO':
        return { key: 'turnovers', keyArr: ['turnovers'] };
      case 'STLS':
        return { key: 'steals', keyArr: ['steals'] };
      case 'BLKS':
        return { key: 'blocks', keyArr: ['blocks'] };
      case 'ASTS':
        return { key: 'assists', keyArr: ['assists'] };
      case 'REBS':
        return { key: 'rebounds', keyArr: ['rebounds'] };

      case 'BS':
        return { key: 'blocks_steals', keyArr: ['blocks', 'steals'] };
      case '3PM':
        return {
          key: 'three_pointers_made',
          keyArr: ['three_pointers_made', 'three_pointers_attempted'],
        };
      case '3PA':
        return {
          key: 'three_pointers_attempted',
          keyArr: ['three_pointers_attempted'],
        };
      // case '2PA':
      //   return { key: 'two_pointers_made', keyArr: ['two_pointers_made'] };
      case 'PA':
        return { key: 'points_assists', keyArr: ['points', 'assists'] };
      case 'PR':
        return { key: 'points_rebounds', keyArr: ['points', 'rebounds'] };
      case 'RA':
        return { key: 'rebounds_assists', keyArr: ['rebounds', 'assists'] };
      case 'PRA':
        return {
          key: 'points_rebounds_assists',
          keyArr: ['points', 'rebounds', 'assists'],
        };
      default:
        return { key: '', keyArr: [] };
    }
  }

  getStatsList() {
    return [
      {
        id: 'MIN',
        name: 'Minutes Played',
      },
      {
        id: 'PTS',
        name: 'Points',
      },
      {
        id: 'REBS',
        name: 'Rebounds',
      },
      {
        id: 'ASTS',
        name: 'Assists',
      },
      {
        id: 'PA',
        name: 'Points & Assists',
      },
      {
        id: 'PR',
        name: 'Points & Rebounds',
      },
      {
        id: 'BLKS',
        name: 'blocks',
      },
      {
        id: 'STLS',
        name: 'Steals',
      },
      {
        id: 'TO',
        name: 'Turnovers',
      },
      {
        id: '3PM',
        name: 'Three Pointers Made',
      },
      {
        id: '3PA',
        name: '3-PT Attempts',
      },
      {
        id: 'BS',
        name: 'Blocks & Steals',
      },
      {
        id: 'RA',
        name: 'Rebounds & Assists',
      },
      {
        id: 'PRA',
        name: 'Points, Rebounds & Assists',
      },
    ];
  }
}
