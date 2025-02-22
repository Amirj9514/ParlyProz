import { Injectable } from '@angular/core';
type PlayerStat = {
  player_id: number;
  player_name: string;
  stat_field: string;
  line_value: number;
};

type TransformedStats = {
  player_id: number;
  player_name: string;
  stats: { key: string; values: number[] }[];
};

@Injectable({
  providedIn: 'root',
})
export class PlayerStatsService {
  private playerStats: any[] = [];
  private lineStats: any[] = [];

  // ----------------- Line Stats -----------------
  //====================================================================

  getStatLineValuesByName = (statsKey: string) => {
    const key = this.getStatsKeyByStatsId(statsKey);

    let totalVal: any[] = [];
    this.lineStats.map((item: any) => {
      this.lineStats.map((item: any) => {
        if (item.key === key.key) {
          return (totalVal = item.values);
        }
      });
    });

    return totalVal;
  };

  setLineStats = (data: any) => {
    this.lineStats = this.transformStats(data)?.stats ?? [];
  };

  transformStats(data: PlayerStat[]): TransformedStats {
    const result: TransformedStats = {
      player_id: data[0]?.player_id ?? '',
      player_name: data[0]?.player_name ?? '',
      stats: [],
    };
    const statMap: Record<string, number[]> = {};
    for (const entry of data) {
      if (!statMap[entry.stat_field]) {
        statMap[entry.stat_field] = [];
      }
      statMap[entry.stat_field].push(entry.line_value);
    }

    result.stats = Object.entries(statMap).map(([key, values]) => ({
      key,
      values,
    }));

    return result;
  }

  // ----------------- End of Line Stats -----------------
  //====================================================================

  //====================================================================
  // ----------------- Player Stats -----------------
  //====================================================================

  setPlayerData(data: any) {
    this.playerStats = data;
  }

  getPlayerData(numberOfPlayers: number ,order: 'asc' | 'desc' = 'asc') {
    
    const players = this.playerStats.slice(0, numberOfPlayers);
    return players.sort((a, b) => {
      const diff = new Date(a.match_datetime).getTime() - new Date(b.match_datetime).getTime();
      return order === 'asc' ? diff : -diff;
    });
  }

  preparePlayerStatsGraphData(stats: string, numberOfPlayers: number, lineVal: number) {
    const players = this.getPlayerData(numberOfPlayers);
    const key = this.getStatsKeyByStatsId(stats);
  
    const datasets = players.map((player: any) => {
      const date = new Date(player.match_datetime);
      const localDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));

      const finalDate = this.convertToEST(player.match_datetime);
      const finalDateObj = new Date(finalDate);
      const formattedDate = `${String(finalDateObj.getMonth() + 1).padStart(2, '0')}-${String(finalDateObj.getDate()).padStart(2, '0')}`;
      const values: Record<string, number> = {};
      const valueArray: any[] = [];
  
      key.keyArr.forEach((k: string) => {
        let value = player[k];
        if (typeof value === 'string') {
          value = parseFloat(value);
        }
        const shortName = this.returnShortName(k);
        values[shortName] = value || 0;
        if(shortName === '3PM' || shortName === '3PA') {
          valueArray.push({ name:shortName, value: value || 0 });
        }else{
          valueArray.push({ name:k, value: value || 0 });
        }
        
      });
  
      return {
        category: `${formattedDate}_${player?.opponent ?? ''}_${player?.match_datetime ?? ''}`,
        values,
        data: {
          date: formattedDate,
          opponent: player.opponent,
          player: player.name,
          value: valueArray,
        }
      };
    });
    return datasets;
  }

  convertToEST(dateString:any) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(date);
}
  

  calculatePlayerAvgAndHR(baseLine: number | null, stats: string) {
    const ranges = [5, 10, 15, 20];
    const results: any = {};

    ranges.forEach((range) => {
      let lineVal = 0;
      const players = this.playerStats.slice(0, range);

      if (!baseLine) {
        const lines = this.getStatLineValuesByName(stats);
        lineVal = lines.length ? lines[0] : 0;
      } else {
        lineVal = baseLine;
      }

      let totalArry: any[] = [];

      if(stats !== '3PM'){
        const key = this.getStatsKeyByStatsId(stats);
        key.keyArr.forEach((item) => {
          let prevArry: any[] = [];
          players.forEach((player: any) => {
            const value = player[item] ? parseFloat(player[item]) : 0;
            prevArry.push(value);
          });
          totalArry.push(prevArry);
        });
      }else{
        let prevArry: any[] = [];
        players.forEach((player: any) => {
          const value = player['three_pointers_made'] ? parseFloat(player['three_pointers_made']) : 0;
          prevArry.push(value);
        });
        totalArry.push(prevArry);
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
      default:
        return '';
        break;
    }
  }

  // ----------------- End of Player Stats -----------------
  //====================================================================

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
    ];
  }
}
