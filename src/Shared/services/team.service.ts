import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  teamData: any[] = [];
  constructor() {}


  upadateDate = new BehaviorSubject<string>('');

  setUpdateDate(date: string) {
    this.upadateDate.next(date);
  }

  getUpdateDate() {
    return this.upadateDate;
  }

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
      const date = new Date(player.match_datetime);
      const localDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
      const formattedDate = `${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;
      const values: Record<string, number> = {};
      const valueArray: any[] = [];
  
      key.keyArr.forEach((k: string) => {
        let value = player[k];
        if (typeof value === 'string') {
          value = parseFloat(value);
        }
        const shortName = this.returnShortName(k);
        values[shortName] = value || 0;
        if(shortName === '3PM' || shortName === '3PA' || shortName === 'FGM' || shortName === 'FGA' || shortName === 'FTM' || shortName === 'FTA') {
          valueArray.push({ name:shortName, value: value || 0 });
        }else{
          valueArray.push({ name:k, value: value || 0 });
        }
        
      });
  
      return {
        category: `${formattedDate}_${player?.opponent_tricode ?? ''}_${player?.match_datetime ?? ''}`,
        values,
        data: {
          date: formattedDate,
          opponent: player.opponent_tricode,
          player: player.name,
          value: valueArray,
        }
      };
    });
    return datasets;
  }


  calculatePlayerAvgAndHR(baseLine: number | null, stats: string) {
    const ranges = [5, 10, 15, 20];
    const results: any = {};

    ranges.forEach((range) => {
      let lineVal = 0;
      const players = this.teamData.slice(0, range);

     
        lineVal = baseLine || 0;
 

      let totalArry: any[] = [];
      if(stats === '3PM'){
        let prevArry: any[] = [];
        players.forEach((player: any) => {
          const value = player['three_pointers_made'] ? parseFloat(player['three_pointers_made']) : 0;
          prevArry.push(value);
        });
        totalArry.push(prevArry);
      }else if(stats === 'FTM'){
        let prevArry: any[] = [];
        players.forEach((player: any) => {
          const value = player['free_throws_made'] ? parseFloat(player['free_throws_made']) : 0;
          prevArry.push(value);
        });
        totalArry.push(prevArry);

      }else if(stats === 'FGM'){
        let prevArry: any[] = [];
        players.forEach((player: any) => {
          const value = player['field_goals_made'] ? parseFloat(player['field_goals_made']) : 0;
          prevArry.push(value);
        });
        totalArry.push(prevArry);
      } else{
        const key = this.getStatsKeyByStatsId(stats);
        key.keyArr.forEach((item) => {
          let prevArry: any[] = [];
          players.forEach((player: any) => {
            const value = player[item] ? parseFloat(player[item]) : 0;
            prevArry.push(value);
          });
          totalArry.push(prevArry);
        });
      }

      const combinedArry = totalArry.reduce((acc, arr) =>
        this.addArrays(acc, arr)
      );

      let aboveBaseLineCount = 0;
      let totalValue = 0;
      let totalEntries = 0;

      combinedArry.forEach((value: any) => {
        totalValue += value;
        totalEntries++;
        if (value >= lineVal) {
          aboveBaseLineCount++;
        }
      });
      const average = totalEntries > 0 ? totalValue / totalEntries : 0;
      const percentageAboveBaseLine =
        totalEntries > 0 ? (aboveBaseLineCount / totalEntries) * 100 : 0;

      results[`L${range}`] = {
        average: parseFloat(average.toFixed(1)),
        percentageAboveBaseLine: parseFloat(percentageAboveBaseLine.toFixed(1)),
        aboveBaseLineCount,
      };
    });

    return results;
  }

  addArrays(arr1: any, arr2: any) {
    return arr1.map((num: number, index: number) => num + (arr2[index] || 0));
  }

  
  returnShortName(name: string) {
    switch (name) {
      case 'minutes':
        return 'MIN';
      case 'points':
        return 'Pts';
      case 'turnovers':
        return 'TO';
      case 'steals':
        return 'Stl';
      case 'blocks':
        return 'Blk';
      case 'assists':
        return 'Ast';
      case 'rebounds':
        return 'Reb';
      case 'three_pointers_made':
        return '3PM';
      case 'three_pointers_attempted':
        return '3PA';
      case 'field_goals_made':
        return 'FGM';
      case 'field_goals_attempted':
        return 'FGA';
      case 'free_throws_made':
        return 'FTM';
      case 'free_throws_attempted':
        return 'FTA';
      case 'fouls_personal':
        return 'PF';

      default:
        return '';
        break;
    }
  }

  getStatsIdByKey(key: string): string | null {
    const mapping: { [key: string]: string } = {
      minutes: 'MIN',
      points: 'PTS',
      turnovers: 'TO',
      steals: 'STLS',
      blocks: 'BLKS',
      assists: 'ASTS',
      rebounds: 'REBS',
      blocks_steals: 'BS',
      three_pointers_made: '3PM',
      three_pointers_attempted: '3PA',
      points_assists: 'PA',
      points_rebounds: 'PR',
      rebounds_assists: 'RA',
      points_assists_rebounds: 'PRA',
      field_goals_made: 'FGM',
      field_goals_attempted: 'FGA',
      free_throws_made: 'FTM',
      free_throws_attempted: 'FTA',
      fouls_personal: 'PF',
    };

    return mapping[key] || null;
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


      case 'FGM':
        return { key: 'field_goals_made', keyArr: ['field_goals_made', 'field_goals_attempted'] };

      case 'FGA':
        return { key: 'field_goals_attempted', keyArr: ['field_goals_attempted'] };
      case 'FTM':
        return { key: 'free_throws_made', keyArr: ['free_throws_made', 'free_throws_attempted'] };
      case 'FTA':
        return { key: 'free_throws_attempted', keyArr: ['free_throws_attempted'] };

      case 'PF':
        return { key: 'fouls_personal', keyArr: ['fouls_personal'] };
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
        id: 'RA',
        name: 'Rebounds & Assists',
      },
      {
        id: 'PRA',
        name: 'Points, Rebounds & Assists',
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
        id: 'BS',
        name: 'Blocks & Steals',
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
        id: 'FGM',
        name: 'FG Made',
      },
      {
        id: 'FGA',
        name: 'FG Attempted',
      },
      {
        id: 'FTM',
        name: 'FT Made',
      },
      {
        id: 'FTA',
        name: 'FT Attempted',
      },
      {
        id: 'PF',
        name: 'Personal Fouls'
      },
      // {
      //   id: 'PFs',
      //   name: 'Personal Fouls'
      // },
    ];
  }

  graphDataKeys(activeKey: string) {
    if (activeKey === 'FGM') {
      return ['FGM', 'FGA'];
    }
    else if (activeKey === 'FTM') {
      return ['FTM', 'FTA'];
    } else {
      return ['3PM', '3PA'];
    }

  }
}
