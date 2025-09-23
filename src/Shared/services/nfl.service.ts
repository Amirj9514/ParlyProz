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
export class NflService {
  lineData: any[] = [];
  playerData: any[] = [];
  teamData: any[] = [];
  constructor() { }

  // =======================================================================
  // Player data  Methods
  // =======================================================================

  setPlayerData = (data: any) => {
    this.playerData = data;
  };

  getPlayerData(
    numberOfPlayers: number,
    order: 'asc' | 'desc' = 'asc',
    opponent?: any
  ) {
    let players: any[] = [];
    if (numberOfPlayers === 2025 || numberOfPlayers === 2024) {
      players = this.playerData.filter((player) => {
        const playerSeason = new Date(player.date).getFullYear();
        return playerSeason === numberOfPlayers;
      });
    } else if (opponent) {
      players = this.playerData.filter(
        (player) => player.opponent === opponent
      );
    } else if (numberOfPlayers > 30) {
      numberOfPlayers = this.playerData.length;
      players = this.playerData;
    } else {
      players = this.playerData.slice(0, numberOfPlayers);
    }

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
    opponent?: any
  ) {
    let players: any[] = [];
    if (numberOfPlayers === 100) {
      players = this.getPlayerData(numberOfPlayers, 'asc', opponent);
    } else {
      players = this.getPlayerData(numberOfPlayers);
    }

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
        category: `${formattedDate}_${player?.opponent ?? ''}_${player?.date ?? ''
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

  calculatePlayerAvgAndHR(
    baseLine: number | null,
    stats: string,
    opponent?: string
  ) {
    const ranges = [
      5,
      10,
      15,
      20,
      30,
      2025,
      2024,
      'H2H',
      this.playerData.length,
    ];
    const results: any = {};

    ranges.forEach((range: any, index) => {
      let lineVal = 0;
      let players: any[] = [];
      if (range === 'H2H') {
        players = this.getPlayerData(range, 'asc', opponent);
      } else {
        players = this.getPlayerData(range);
      }
      // const players = this.playerData.slice(0, range);

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
      if (range === 2025 || range === 2024) {
        results[`${range}`] = {
          average: parseFloat(average.toFixed(1)),
          percentageAboveBaseLine: parseFloat(
            percentageAboveBaseLine.toFixed(1)
          ),
          aboveBaseLineCount,
        };
      } else if (index === ranges.length - 1) {
        results[`All`] = {
          average: parseFloat(average.toFixed(1)),
          percentageAboveBaseLine: parseFloat(
            percentageAboveBaseLine.toFixed(1)
          ),
          aboveBaseLineCount,
        };
      } else {
        results[range === 'H2H' ? 'H2H' : `L${range}`] = {
          average: parseFloat(average.toFixed(1)),
          percentageAboveBaseLine: parseFloat(
            percentageAboveBaseLine.toFixed(1)
          ),
          aboveBaseLineCount,
        };
      }
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
        category: `${formattedDate}_${player?.opponent_tricode ?? ''}_${player?.match_datetime ?? ''
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
        id: 'REC',
        name: 'Receptions',
      },

      {
        id: 'REC YDS',
        name: 'Receiving Yards',
      },
      {
        id: 'TGTS',
        name: 'Receiving Targets',
      },
      {
        id: 'R+R TD',
        name: 'Rush+Rec TDs',
      },
      {
        id: 'Rush TDs',
        name: 'Rush TDs',
      },
      {
        id: 'REC TD',
        name: 'Receiving Touchdowns',
      },

      {
        id: 'RUSH YDS',
        name: 'Rush Yards',
      },

      {
        id: 'R+R YDS',
        name: 'Rush + Rec Yds',
      },

      {
        id: 'LONG RUSH',
        name: 'Longest Rush',
      },
      // {
      //   id: 'LONG COMP',
      //   name: 'Longest Completion',
      // },
      {
        id: 'LONG REC',
        name: 'Longest Reception',
      },

      {
        id: 'P YDS',
        name: 'Passing Yards',
      },

      {
        id: 'P TDS',
        name: 'Passing Touchdowns',
      },
      {
        id: 'P ATT',
        name: 'Passing Attempts',
      },
      {
        id: 'PASS COMP',
        name: 'Passing Completions',
      },
      {
        id: 'INT',
        name: 'Interceptions',
      },
      {
        id: 'P+R YDS',
        name: 'Pass + Rush Yards',
      },
      {
        id: 'RUSH ATT',
        name: 'Rush Attempts',
      },
      {
        id: 'KPTS',
        name: 'Kicking Points',
      },
      {
        id: 'SACKS',
        name: 'Sacks',
      },
      {
        id: 'TACKLES',
        name: 'Tackles',
      },
      // {
      //   id: 'PM',
      //   name: 'Plus Minus',
      // },
    ];
  }

  getTeamStatsList() {
    return [
      {
        id: 'REC',
        name: 'Receptions',
      },
      {
        id: 'REC YDS',
        name: 'Receiving Yards',
      },
      {
        id: 'TGTS',
        name: 'Receiving Targets',
      },
      {
        id: 'R+R TD',
        name: 'Rush+Rec TDs',
      },
      {
        id: 'Rush TDs',
        name: 'Rush TDs',
      },
      {
        id: 'REC TD',
        name: 'Receiving Touchdowns',
      },

      {
        id: 'RUSH YDS',
        name: 'Rush Yards',
      },
      {
        id: 'R+R YDS',
        name: 'Rush + Rec Yds',
      },

      {
        id: 'LONG RUSH',
        name: 'Longest Rush',
      },
      {
        id: 'LONG REC',
        name: 'Longest Reception',
      },
      // {
      //   id: 'PM',
      //   name: 'Plus Minus',
      // },
    ];
  }

  getStatsKeyByStatsId(statsId: string): { key: string; keyArr: string[] } {
    switch (statsId) {
      // , 'receiving_targets'
      case 'REC':
        return {
          key: 'receiving_receptions',
          keyArr: ['receiving_receptions'],
        };
      case 'REC YDS':
        return { key: 'receiving_yards', keyArr: ['receiving_yards'] };
      case 'TGTS':
        return { key: 'receiving_targets', keyArr: ['receiving_targets'] };
      case 'R+R TD':
        return { key: 'rush_rec_touchdowns', keyArr: ['rush_rec_touchdowns'] };
      case 'Rush TDs':
        return { key: 'rushing_touchdowns', keyArr: ['rushing_touchdowns'] };
      case 'REC TD':
        return {
          key: 'receiving_touchdowns',
          keyArr: ['receiving_touchdowns'],
        };
      case 'RUSH YDS':
        return { key: 'rushing_yards', keyArr: ['rushing_yards'] };
      case 'R+R YDS':
        return { key: 'rush_rec_yards', keyArr: ['rush_rec_yards'] };
      case 'LONG RUSH':
        return { key: 'rushing_longest_run', keyArr: ['rushing_longest_run'] };
      case 'LONG REC':
        return {
          key: 'receiving_long_reception',
          keyArr: ['receiving_long_reception'],
        };
      case 'P YDS':
        return { key: 'passing_yards', keyArr: ['passing_yards'] };
      case 'P TDS':
        return { key: 'passing_touchdowns', keyArr: ['passing_touchdowns'] };
      case 'P ATT':
        return { key: 'passing_attempts', keyArr: ['passing_attempts'] };
      case 'PASS COMP':
        return { key: 'passing_completions', keyArr: ['passing_completions'] };
      case 'P+R YDS':
        return { key: 'pass_rush_yards', keyArr: ['pass_rush_yards'] };
      case 'INT':
        return { key: 'interceptions', keyArr: ['interceptions'] };
      case 'LONG COMP':
        return {
          key: 'passing_longest_completion',
          keyArr: ['passing_longest_completion'],
        };
      case 'RUSH ATT':
        return { key: 'rushing_attempts', keyArr: ['rushing_attempts'] };
      case 'KPTS':
        return { key: 'kicking_points', keyArr: ['kicking_points'] };
      case 'SACKS':
        return { key: 'defensive_sacks', keyArr: ['defensive_sacks'] };
      case 'TACKLES':
        return { key: 'defensive_tackles', keyArr: ['defensive_tackles'] };
      default:
        return { key: '', keyArr: [] };
    }
  }

  getStatsIdByKey(key: string): string | null {
    const mapping: { [key: string]: string } = {
      receiving_receptions: 'REC',
      receiving_yards: 'REC YDS',
      receiving_targets: 'TGTS',
      rush_rec_touchdowns: 'R+R TD',
      rushing_touchdowns: 'Rush TDs',
      receiving_touchdowns: 'REC TD',
      rushing_yards: 'RUSH YDS',
      rush_rec_yards: 'R+R YDS',
      rushing_longest_run: 'LONG RUSH',
      receiving_long_reception: 'LONG REC',
      passing_yards: 'P YDS',
      passing_touchdowns: 'P TDS',
      passing_attempts: 'P ATT',
      passing_completions: 'PASS COMP',
      pass_rush_yards: 'P+R YDS',
      interceptions: 'INT',
      passing_longest_completion: 'LONG COMP',
      rushing_attempts: 'RUSH ATT',
      kicking_points: 'KPTS',
      defensive_sacks: 'SACKS',
      defensive_tackles: 'TACKLES',
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
      case 'receiving_receptions':
        return 'REC';
      case 'receiving_yards':
        return 'REC YDS';
      case 'receiving_targets':
        return 'TGTS';
      case 'rush_rec_touchdowns':
        return 'R+R TD';
      case 'rushing_touchdowns':
        return 'Rush TDs';
      case 'receiving_touchdowns':
        return 'REC TD';
      case 'rushing_yards':
        return 'RUSH YDS';
      case 'rush_rec_yards':
        return 'R+R YDS';
      case 'rushing_longest_run':
        return 'LONG RUSH';
      case 'receiving_long_reception':
        return 'LONG REC';
      case 'passing_yards':
        return 'P YDS';
      case 'passing_touchdowns':
        return 'P TDS';
      case 'passing_attempts':
        return 'P ATT';
      case 'passing_completions':
        return 'PASS COMP';
      case 'pass_rush_yards':
        return 'P+R YDS';
      case 'interceptions':
        return 'INT';
      case 'passing_longest_completion':
        return 'LONG COMP';
      case 'rushing_attempts':
        return 'RUSH ATT';
      case 'kicking_points':
        return 'KPTS';
      case 'defensive_sacks':
        return 'SACKS';
      case 'defensive_tackles':
        return 'TACKLES';
      default:
        return '';
    }
  }

  getPlayerProfile() {
    const playerProfile = this.playerData[0]; // Assuming you want the first player profile
    return playerProfile;
  }
}
