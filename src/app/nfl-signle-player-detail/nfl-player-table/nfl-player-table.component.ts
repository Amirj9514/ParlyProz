import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { MlbService } from '../../../Shared/services/mlb.service';
import { NflService } from '../../../Shared/services/nfl.service';

@Component({
  selector: 'app-nfl-player-table',
  standalone: true,
  imports: [TableModule, CommonModule],
  templateUrl: './nfl-player-table.component.html',
  styleUrl: './nfl-player-table.component.scss',
})
export class NflPlayerTableComponent {
  players: any[] = [];
  statsList: any[] = [];
  constructor(private nhlService: NflService) {}

  ngOnInit(): void {
    this.getPlayerList();
  }

  getPlayerList() {
    this.players = this.nhlService.getPlayerData(15, 'desc');

    if (!this.players.length) return;
    const statsList = this.nhlService.getStatsList();
    let statsKey: string = '';
    let newStatsList: any[] = [];

    statsList.map((stat) => {
      if (stat.id !== 'H+R+RBI') {
        const statName = this.nhlService.getStatsKeyByStatsId(stat.id);
        let isStatFound = false;
        for (const player of this.players) {
          if (player[statName.key] || player[statName.key] === 0) {
            statsKey = statName.key;
            isStatFound = true;
            break;
          }
        }

        if (isStatFound) {
          newStatsList.push({ name: stat.id, key: statsKey });
        }
      }
    });
    this.statsList = newStatsList;
  }

  roundValue(value: number) {
    return value;
  }
}
