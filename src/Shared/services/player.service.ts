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
export class PlayerService {
  constructor() {}

  lineData: any[] = [];
  playerData: any[] = [];

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
  setPlayerData = (data: any) => {
    this.playerData = data;
  };
  getPlayers = (numberOfPlayers: number) => {
    const players = this.playerData.slice(0, numberOfPlayers);
    const sortPlayers = players.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return sortPlayers;
  };

  applyFilterByPlayerStats = (
    statsOf: string,
    numberOfGame: number,
    lineVal: number
  ) => {
    let players = this.getPlayers(numberOfGame);
    const graphData = this.prepareGraphData(players, statsOf, lineVal);
    return { players, graphData };
  };

  prepareGraphData = (players: any[], statsOf: string, lineVal: number) => {
    const labels = players.map((player) => {
      const formattedDate = player?.date
        ? new Date(player.date).toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
          })
        : 'N/A';

      const teamName = player?.opponent || player?.opponent_tricode || 'N/A';

      return `${teamName} - ${formattedDate}`;
    });

    const statsKey = this.getStatsKeyByStatsId(statsOf);

    const baseValue = lineVal;
    // let isExist: boolean = false;

    // this.lineData.map((item: any) => {
    //   if (item.key === statsKey.key) {
    //     if (item.values.includes(baseValue)) {
    //       isExist = true;
    //     }
    //   }
    // });

    const playerData = players.map((player) => {
      const stats = statsKey.keyArr.reduce((acc: any, key) => {
        acc[key] = player[key];
        return acc;
      }, {});

      const totalValue = statsKey.keyArr.reduce((sum, key) => {
        const value = player[key];
        return sum + (typeof value === 'string' ? parseFloat(value) : value);
      }, 0);

      let color =
        totalValue > baseValue ? 'rgba(16, 185, 129, 1)' : 'rgba(255, 0, 0, 1)';

      return { Stats: stats, color, total: totalValue };
    });

    const lineDataSets = {
      type: 'line',
      label: 'Dataset 1',
      borderColor: 'purple',
      borderWidth: 2,
      borderDash: [5, 5],
      fill: false,
      pointRadius: 0, // Hides the dots
      tension: 1,
      data: playerData.map((item: any) => baseValue),
      correctData: playerData.map((item: any) => baseValue),
    };

    return {
      labels,
      datasets: [lineDataSets, ...this.createDataSet(playerData)],
    };
  };
  createDataSet = (data: any) => {
    const statKeys = Object.keys(data[0].Stats);
    const baseOpacity = 1;

    return statKeys.map((statKey, index) => {
      const currentOpacity = baseOpacity - index * 0.3;

      return {
        type: 'bar',
        label: statKey,
        backgroundColor: data.map((item: any) =>
          item.color.replace(
            /rgba\((\d+), (\d+), (\d+), 1\)/,
            `rgba($1, $2, $3, ${currentOpacity.toFixed(2)})`
          )
        ),
        borderColor: data.map((item: any) =>
          item.color.replace(
            /rgba\((\d+), (\d+), (\d+), 1\)/,
            `rgba($1, $2, $3, ${currentOpacity.toFixed(2)})`
          )
        ),
        borderRadius: 10,
        correctData: data.map((item: any) => {
          const value = item.Stats[statKey];
          return typeof value === 'string' ? parseFloat(value) : value;
        }),
        data: data.map((item: any) => {
          const value = item.Stats[statKey];
          return typeof value === 'string' ? parseFloat(value) : value;
        }),
      };
    });
  };

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
        return { key: 'three_pointers_made', keyArr: ['three_pointers_made' , 'three_pointers_attempted'] };
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

  preparePlayerProfile() {
    const player = this.playerData;

    const playerStats: any = player.reduce(
      (acc, player) => {
        acc.points += player.points;
        acc.rebounds += player.rebounds;
        acc.assists += player.assists;
        acc.steals += player.steals;
        acc.turnovers += player.turnovers;
        acc.field_goals_made += player.field_goals_made;
        acc.field_goals_attempted += player.field_goals_attempted;
        acc.two_pointers_made += player.two_pointers_made;
        acc.two_pointers_attempted += player.two_pointers_attempted;
        acc.three_pointers_made += player.three_pointers_made;
        acc.three_pointers_attempted += player.three_pointers_attempted;
        acc.offensive_rebounds += player.offensive_rebounds;
        acc.defensive_rebounds += player.defensive_rebounds;
        return acc;
      },
      {
        points: 0,
        rebounds: 0,
        assists: 0,
        steals: 0,
        turnovers: 0,
        field_goals_made: 0,
        field_goals_attempted: 0,
        two_pointers_made: 0,
        two_pointers_attempted: 0,
        three_pointers_made: 0,
        three_pointers_attempted: 0,
        offensive_rebounds: 0,
        defensive_rebounds: 0,
      }
    );

    for (const key in playerStats) {
      if (playerStats.hasOwnProperty(key)) {
        playerStats[key as keyof typeof playerProfile] = parseFloat(
          playerStats[key as keyof typeof playerProfile].toFixed(1)
        );
      }
    }

    let play = player[0];
    const playerProfile = {
      ...playerStats,
      player_id: play.player_id,
      name: play.name,
      season: play.season,
      team: play.team,
      position: play.position,
      totalMatches: player.length,
    };
    return playerProfile;
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
  
      const combinedArry = totalArry.reduce((acc, arr) => this.addArrays(acc, arr));
  
      let aboveBaseLineCount = 0;
      let totalValue = 0;
      let totalEntries = 0;
  
      combinedArry.forEach((value:any) => {
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
}
