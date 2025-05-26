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
export class MlbService {
  lineData: any[] = [];
  playerData: any[] = [];
  teamData: any[] = [];
  constructor() {}

  // =======================================================================
  // Player data  Methods
  // =======================================================================

  setPlayerData = (data: any) => {
    this.playerData = data;
  };

  getPlayerData(numberOfPlayers: number, order: 'asc' | 'desc' = 'asc') {
    const players = this.playerData.slice(0, numberOfPlayers);
    return players.sort((a, b) => {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      return order === 'asc' ? diff : -diff;
    });
  }

  getAllPlayerData() {
    return this.playerData;
  }

  preparePlayerStatsGraphData(
    stats: string,
    numberOfPlayers: number,
    lineVal: number
  ) {
    const players = this.getPlayerData(numberOfPlayers);

    const key = this.getStatsKeyByStatsId(stats);
    const datasets = players.map((player: any) => {
      const date = new Date(player.date);
      const localDate = new Date(
        date.toLocaleString('en-US', { timeZone: 'UTC' })
      );

      const finalDate = this.convertToEST(player.date);
      const finalDateObj = new Date(finalDate);
      const formattedDate = `${String(finalDateObj.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(finalDateObj.getDate()).padStart(2, '0')}`;
      const values: Record<string, number> = {};
      const valueArray: any[] = [];

      key.keyArr.forEach((k: string) => {
        let value = player[k];
        if (typeof value === 'string') {
          value = parseFloat(value);
        }
        const shortName = this.returnShortName(k);
        values[shortName] = value || 0;
        // if (shortName === '3PM' || shortName === '3PA') {
        //   valueArray.push({ name: shortName, value: value || 0 });
        // } else {
        valueArray.push({ name: k, value: value || 0 });
        // }
      });

      return {
        category: `${formattedDate}_${player?.opponent ?? ''}_${
          player?.date ?? ''
        }`,
        values,
        data: {
          date: formattedDate,
          opponent: player.opponent,
          player: player.name,
          value: valueArray,
        },
      };
    });
    return datasets;
  }

  calculatePlayerAvgAndHR(baseLine: number | null, stats: string) {
    const ranges = [5, 10, 15, 20];
    const results: any = {};

    ranges.forEach((range) => {
      let lineVal = 0;
      const players = this.playerData.slice(0, range);

      if (!baseLine) {
        const lines = this.getStatLineValuesByName(stats);
        lineVal = lines.length ? lines[0] : 0;
      } else {
        lineVal = baseLine;
      }

      let totalArry: any[] = [];
      const key = this.getStatsKeyByStatsId(stats);

      key.keyArr.forEach((item) => {
        let prevArry: any[] = [];
        players.forEach((player: any) => {
          const value = player[item] ? parseFloat(player[item]) : 0;
          prevArry.push(value);
        });
        totalArry.push(prevArry);
      });

      let combinedArry: any[] = [];
      if (totalArry.length > 0) {
        combinedArry = totalArry.reduce((acc, arr) => this.addArrays(acc, arr));
      }

      let aboveBaseLineCount = 0;
      let totalValue = 0;
      let totalEntries = 0;

      combinedArry.forEach((value: any) => {
        totalValue += value;
        totalEntries++;
        if (value > lineVal) {
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

  // =======================================================================
  // Team data  Methods
  // =======================================================================

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

  prepareTeamStatsGraphData(
    stats: string,
    numberOfPlayers: number,
    lineVal: number
  ) {
    const players = this.getTeamData(numberOfPlayers);
    const key = this.getStatsKeyByStatsId(stats);
    const datasets = players.map((player: any) => {
      const date = new Date(player.match_datetime);
      const localDate = new Date(
        date.toLocaleString('en-US', { timeZone: 'UTC' })
      );
      const formattedDate = `${String(localDate.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(localDate.getDate()).padStart(2, '0')}`;
      const values: Record<string, number> = {};
      const valueArray: any[] = [];

      key.keyArr.forEach((k: string) => {
        let value = player[k];
        if (typeof value === 'string') {
          value = parseFloat(value);
        }
        const shortName = this.returnShortName(k);
        values[shortName] = value || 0;
        valueArray.push({ name: k, value: value || 0 });
      });

      return {
        category: `${formattedDate}_${player?.opponent_tricode ?? ''}_${
          player?.match_datetime ?? ''
        }`,
        values,
        data: {
          date: formattedDate,
          opponent: player.opponent_tricode,
          player: player.name,
          value: valueArray,
        },
      };
    });
    return datasets;
  }

  calculateTeamAvgAndHR(baseLine: number | null, stats: string) {
    const ranges = [5, 10, 15, 20];
    const results: any = {};

    ranges.forEach((range) => {
      let lineVal = 0;
      const players = this.teamData.slice(0, range);

      lineVal = baseLine || 0;

      let totalArry: any[] = [];
      if (stats !== '3PM') {
        const key = this.getStatsKeyByStatsId(stats);
        key.keyArr.forEach((item) => {
          let prevArry: any[] = [];
          players.forEach((player: any) => {
            const value = player[item] ? parseFloat(player[item]) : 0;
            prevArry.push(value);
          });
          totalArry.push(prevArry);
        });
      } else {
        let prevArry: any[] = [];
        players.forEach((player: any) => {
          const value = player['three_pointers_made']
            ? parseFloat(player['three_pointers_made'])
            : 0;
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

  // =======================================================================

  //====================================================================
  // ----------------- Line Stats  Start-----------------

  getStatLineValuesByName = (statsKey: string) => {
    const key = this.getStatsKeyByStatsId(statsKey);

    let totalVal: any[] = [];
    this.lineData.map((item: any) => {
      this.lineData.map((item: any) => {
        if (item.key === key.key) {
          return (totalVal = item.values);
        }
      });
    });

    return totalVal;
  };

  setLineStats = (data: any) => {
    this.lineData = this.transformStats(data)?.stats ?? [];
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

  // ----------------- Line Stats Ends-----------------
  //====================================================================

  getStatsList() {
    return [
      {
        id: 'B-WALKS',
        name: 'Batter Walks',
      },
      {
        id: 'HITS',
        name: 'Hits',
      },
      {
        id: 'RUNS',
        name: 'Runs',
      },
      {
        id: 'RBIS',
        name: 'RBIs',
      },
      {
        id: 'H+R+RBI',
        name: 'Hits+Runs+RBIs',
      },
      {
        id: '1B',
        name: 'Singles',
      },
      {
        id: '2B',
        name: 'Doubles',
      },
      {
        id: '3B',
        name: 'Triples',
      },
      {
        id: 'HR',
        name: 'Home Runs',
      },

      {
        id: 'STEALS',
        name: 'Stolen Bases',
      },
      {
        id: 'HIT SO',
        name: 'Hitter Strikeouts',
      },
      {
        id: 'HA',
        name: 'Hits Allowed',
      },
      {
        id: 'P-WALKS',
        name: 'Walks Allowed',
      },
      {
        id: 'ER',
        name: 'Earned Runs Allowed',
      },
      {
        id: 'PIT SO',
        name: 'Pitcher Strikeouts',
      },
      {
        id: 'WINS',
        name: 'Pitcher Wins',
      },
      {
        id: 'PO',
        name: 'Pitching Outs',
      },
      {
        id: 'P',
        name: 'Total Pitches',
      },
      {
        id: 'BASES',
        name: 'Total Bases',
      },
    ];
  }

  getTeamStatsList() {
    return [
      {
        id: 'B-WALKS',
        name: 'Batter Walks',
      },
      {
        id: 'HITS',
        name: 'Hits',
      },
      {
        id: 'RUNS',
        name: 'Runs',
      },
      {
        id: 'RBIS',
        name: 'RBIs',
      },
      {
        id: 'H+R+RBI',
        name: 'Hits+Runs+RBIs',
      },
      {
        id: '2B',
        name: 'Doubles',
      },
      {
        id: '3B',
        name: 'Triples',
      },
      {
        id: 'HR',
        name: 'Home Runs',
      },

      {
        id: 'STEALS',
        name: 'Stolen Bases',
      },
      {
        id: 'HIT SO',
        name: 'Hitter Strikeouts',
      },
      {
        id: 'HA',
        name: 'Hits Allowed',
      },
      {
        id: 'P-WALKS',
        name: 'Walks Allowed',
      },
      {
        id: 'ER',
        name: 'Earned Runs Allowed',
      },
      {
        id: 'PIT SO',
        name: 'Pitcher Strikeouts',
      },
      {
        id: 'WINS',
        name: 'Pitcher Wins',
      },
        {
        id: 'PO',
        name: 'Pitching Outs',
      },
      {
        id: 'P',
        name: 'Total Pitches',
      },
      {
        id: 'BASES',
        name: 'Total Bases',
      },
      
    ];
  }

  getStatsKeyByStatsId(statsId: string): { key: string; keyArr: string[] } {
    switch (statsId) {
      case 'B-WALKS':
        return { key: 'batter_walks', keyArr: ['batter_walks'] };
      case 'HITS':
        return { key: 'hits', keyArr: ['hits'] };
      case 'RUNS':
        return { key: 'runs', keyArr: ['runs'] };
      case 'RBIS':
        return { key: 'rbis', keyArr: ['rbis'] };
      case 'H+R+RBI':
        return { key: 'hits_runs_rbis', keyArr: ['hits', 'runs', 'rbis'] };
      case '2B':
        return { key: 'doubles', keyArr: ['doubles'] };
      case '3B':
        return { key: 'triples', keyArr: ['triples'] };
      case 'HR':
        return { key: 'home_runs', keyArr: ['home_runs'] };
      case 'STEALS':
        return { key: 'stolen_bases', keyArr: ['stolen_bases'] };

      case 'HIT SO':
        return { key: 'hitter_strike_outs', keyArr: ['hitter_strike_outs'] };
      case 'HA':
        return { key: 'hits_allowed', keyArr: ['hits_allowed'] };
      case 'P-WALKS':
        return { key: 'walks_allowed', keyArr: ['walks_allowed'] };
      case 'ER':
        return { key: 'earned_runs_allowed', keyArr: ['earned_runs_allowed'] };
      case 'PIT SO':
        return {
          key: 'pitching_strike_outs',
          keyArr: ['pitching_strike_outs'],
        };
      case 'WINS':
        return { key: 'pitcher_wins', keyArr: ['pitcher_wins'] };
      
      case 'PO':
        return { key: 'pitching_outs', keyArr: ['pitching_outs'] };

      case 'P':
        return { key: 'total_pitches', keyArr: ['total_pitches'] };
      
      case 'BASES':
        return { key: 'total_bases', keyArr: ['total_bases'] };
      case '1B':
        return { key: 'singles', keyArr: ['singles'] };

      default:
        return { key: '', keyArr: [] };
    }
  }

  getStatsIdByKey(key: string): string | null {
    const mapping: { [key: string]: string } = {
      batter_walks: 'B-WALKS',
      hits: 'HITS',
      runs: 'RUNS',
      rbis: 'RBIS',
      doubles: '2B',
      triples: '3B',
      home_runs: 'HR',
      hits_runs_rbis:'H+R+RBI',
      stolen_bases: 'STEALS',
      hitter_strike_outs: 'HIT SO',
      hits_allowed: 'HA',
      walks_allowed: 'P-WALKS',
      earned_runs_allowed: 'ER',
      pitching_strike_outs: 'PIT SO',
      pitcher_wins: 'WINS',
      pitching_outs: 'PO',
      total_pitches: 'P',
      total_bases: 'BASES',
      singles: '1B',
    };

    return mapping[key] || null;
  }

  convertToEST(dateString: any) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);
  }

  returnShortName(name: string) {
    switch (name) {
      case 'batter_walks':
        return 'B-WALKS';
      case 'hits':
        return 'HITS';
      case 'runs':
        return 'RUNS';
      case 'rbis':
        return 'RBIS';
      case 'hits_allowed':
        return 'HA';
      case 'walks_allowed':
        return 'P-WALKS';
      case 'earned_runs_allowed':
        return 'ER';
      case 'pitching_strike_outs':
        return 'PIT SO';
      case 'pitcher_wins':
        return 'WINS';
      case 'hitter_strike_outs':
        return 'HIT SO';
      case 'home_runs':
        return 'HR';
      case 'stolen_bases':
        return 'STEALS';
      case 'doubles':
        return '2B';
      case 'triples':
        return '3B';
      case 'singles':
        return '1B';
      case 'pitching_outs':
        return 'PO';
      case 'total_pitches':
        return 'P';
      case 'total_bases':
        return 'BASES';

      default:
        return '';
        break;
    }
  }

  getPlayerProfile() {
    const playerProfile = this.playerData[0]; // Assuming you want the first player profile
    return playerProfile;
  }
}
