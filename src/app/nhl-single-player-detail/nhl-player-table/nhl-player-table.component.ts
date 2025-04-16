import { Component } from '@angular/core';
import { PlayerStatsService } from '../../../Shared/services/player-stats.service';
import { NhlService } from '../../../Shared/services/nhl.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-nhl-player-table',
  standalone: true,
  imports: [TableModule , CommonModule],
  templateUrl: './nhl-player-table.component.html',
  styleUrl: './nhl-player-table.component.scss'
})
export class NhlPlayerTableComponent {
 players: any[] = [];
  constructor(private  nhlService:NhlService){}

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
