import { Component } from '@angular/core';
import { PlayerStatsService } from '../../../Shared/services/player-stats.service';
import { NhlService } from '../../../Shared/services/nhl.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { MlbService } from '../../../Shared/services/mlb.service';

@Component({
  selector: 'app-mlb-player-table',
  standalone: true,
    imports: [TableModule , CommonModule],
  templateUrl: './mlb-player-table.component.html',
  styleUrl: './mlb-player-table.component.scss'
})
export class MlbPlayerTableComponent {
 players: any[] = [];
  constructor(private  nhlService:MlbService){}

  ngOnInit(): void {
    this.getPlayerList();
  }

  getPlayerList() {
    this.players =  this.nhlService.getPlayerData(15 , 'desc');
  }

  roundValue(value: number) {
    return (value);
  }

}
