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
export class NhlService {
  lineData: any[] = [];
  playerData: any[] = [];
  teamData: any[] = [];
  constructor() {}

  // =======================================================================
  // Player data  Methods
  // =======================================================================

  setPlayerData = (data: any) => {
    this.playerData = data.filter((player: any) => {
      const rawTOI = player.time_on_ice;
      if (!rawTOI) return false;
      const parsed = parseFloat(String(rawTOI));
      if (isNaN(parsed) || parsed === 0) {
        return false;
      }
      return true;
    });
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
      players = [...this.playerData]; // clone instead of reference
    } else {
      players = this.playerData.slice(0, numberOfPlayers);
    }

    // clone before sorting to avoid mutating original array
    return [...players].sort((a, b) => {
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
      const { values, valueArray } = this.buildGraphStatValues(stats, player);

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

      const combinedArry = players.map((player: any) =>
        this.getGraphComparisonValue(stats, player)
      );

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

  private buildGraphStatValues(
    stats: string,
    row: any
  ): { values: Record<string, number>; valueArray: any[] } {
    if (stats === 'FOW') {
      const wins = this.toNumber(row?.face_off_wins);
      const attempts = this.toNumber(row?.face_off_attempts);
      const remainingAttempts = Math.max(attempts - wins, 0);

      return {
        values: {
          FOW: wins,
          FOA: remainingAttempts,
        },
        valueArray: [
          { name: 'FOA', value: attempts },
          { name: 'FOW', value: wins },
        ],
      };
    }

    const key = this.getStatsKeyByStatsId(stats);
    const values: Record<string, number> = {};
    const valueArray: any[] = [];

    key.keyArr.forEach((k: string) => {
      const value = this.toNumber(row?.[k]);
      const shortName = this.returnShortName(k);
      values[shortName] = value;
      valueArray.push({ name: k, value });
    });

    return { values, valueArray };
  }

  private getGraphComparisonValue(stats: string, row: any): number {
    if (stats === 'FOW') {
      return this.toNumber(row?.face_off_wins);
    }

    const key = this.getStatsKeyByStatsId(stats);
    return key.keyArr.reduce(
      (sum, item) => sum + this.toNumber(row?.[item]),
      0
    );
  }

  private toNumber(value: any): number {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : 0;
    }

    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
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
    const datasets = players.map((player: any) => {
      const date = new Date(player.match_datetime);
      const localDate = new Date(
        date.toLocaleString('en-US', { timeZone: 'UTC' })
      );
      const formattedDate = `${String(localDate.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(localDate.getDate()).padStart(2, '0')}`;
      const { values, valueArray } = this.buildGraphStatValues(stats, player);

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

      const combinedArry = players.map((player: any) =>
        this.getGraphComparisonValue(stats, player)
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
        id: 'TOI',
        name: 'Time On Ice',
      },
      {
        id: 'PTS',
        name: 'Points',
      },
      {
        id: 'GOALS',
        name: 'Goals',
      },
      {
        id: 'ASTS',
        name: 'Assists',
      },
      {
        id: 'SHOTS',
        name: 'Shots on Goal',
      },
      {
        id: 'HIT',
        name: 'Hits',
      },
      {
        id: 'BLOCKED SHOTS',
        name: 'Blocked Shots',
      },
      {
        id: 'FOW',
        name: 'Faceoff Wins',
      },
      {
        id: 'FOA',
        name: 'Faceoff Attempts',
      },
      {
        id: 'SAVES',
        name: 'Saves',
      },
      {
        id: 'GA',
        name: 'Goals Against',
      },
      // {
      //   id: 'PM',
      //   name: 'Plus Minus',
      // },
    ];
  }

  getTeamStatsList() {
    return [
      // {
      //   id: 'TOI',
      //   name: 'Time On Ice',
      // },
      {
        id: 'PTS',
        name: 'Points',
      },
      {
        id: 'GOALS',
        name: 'Goals',
      },
      {
        id: 'ASTS',
        name: 'Assists',
      },
      {
        id: 'SHOTS',
        name: 'Shots on Goal',
      },
      {
        id: 'HIT',
        name: 'Hits',
      },
      {
        id: 'BLOCKED SHOTS',
        name: 'Blocked Shots',
      },
      {
        id: 'FOW',
        name: 'Faceoff Wins',
      },
      {
        id: 'FOA',
        name: 'Faceoff Attempts',
      },
      {
        id: 'SAVES',
        name: 'Saves',
      },
      {
        id: 'GA',
        name: 'Goals Against',
      },
      // {
      //   id: 'PM',
      //   name: 'Plus Minus',
      // },
    ];
  }

  getStatsKeyByStatsId(statsId: string): { key: string; keyArr: string[] } {
    switch (statsId) {
      case 'PTS':
        return { key: 'points', keyArr: ['points'] };
      case 'GOALS':
        return { key: 'goals', keyArr: ['goals'] };
      case 'ASTS':
        return { key: 'assists', keyArr: ['assists'] };
      case 'SHOTS':
        return { key: 'shots_on_goal', keyArr: ['shots_on_goal'] };
      case 'HIT':
        return { key: 'hits', keyArr: ['hits'] };
      case 'BLOCKED SHOTS':
        return { key: 'blocked_shots', keyArr: ['blocked_shots'] };
      case 'FOW':
        return { key: 'face_off_wins', keyArr: ['face_off_wins'] };
      case 'FOA':
        return { key: 'face_off_attempts', keyArr: ['face_off_attempts'] };
      case 'SAVES':
        return { key: 'saves', keyArr: ['saves'] };
      case 'GA':
        return { key: 'goals_against', keyArr: ['goals_against'] };
      case 'PM':
        return { key: 'plus_minus', keyArr: ['plus_minus'] };

      case 'TOI':
        return { key: 'time_on_ice', keyArr: ['time_on_ice'] };
      default:
        return { key: '', keyArr: [] };
    }
  }

  getStatsIdByKey(key: string): string | null {
    const mapping: { [key: string]: string } = {
      points: 'PTS',
      goals: 'GOALS',
      assists: 'ASTS',
      shots_on_goal: 'SHOTS',
      hits: 'HIT',
      blocked_shots: 'BLOCKED SHOTS',
      face_off_wins: 'FOW',
      face_off_attempts: 'FOA',
      saves: 'SAVES',
      goals_against: 'GA',
      plus_minus: 'PM',
      time_on_ice: 'TOI',
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
      case 'time_on_ice':
        return 'TOI';
      case 'points':
        return 'PTS';
      case 'goals':
        return 'GOALS';
      case 'assists':
        return 'ASTS';
      case 'shots_on_goal':
        return 'SHOTS';
      case 'blocked_shots':
        return 'BLOCKED SHOTS';
      case 'face_off_wins':
        return 'FOW';
      case 'face_off_attempts':
        return 'FOA';
      case 'saves':
        return 'SAVES';
      case 'goals_against':
        return 'GA';
      case 'plus_minus':
        return 'PM';
      case 'hits':
        return 'HIT';
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
