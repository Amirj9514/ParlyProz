import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { MlbService } from '../../../Shared/services/mlb.service';

@Component({
  selector: 'app-mlb-player-table',
  standalone: true,
  imports: [TableModule, CommonModule],
  templateUrl: './mlb-player-table.component.html',
  styleUrl: './mlb-player-table.component.scss',
})
export class MlbPlayerTableComponent {
  players: any[] = [];
  statsList: any[] = [];
  constructor(private nhlService: MlbService) {}

  ngOnInit(): void {
    this.getPlayerList();
  }

  getPlayerList() {
    this.players = this.nhlService.getPlayerData(15, 'desc');

    if(!this.players.length) return;
    const statsList = this.nhlService.getStatsList();
    let statsKey:string = '';
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
          newStatsList.push({name:stat.id , key: statsKey});
        }
      }
    });
    this.statsList = newStatsList;
  }

  roundValue(value: number) {
    return value;
  }
}
