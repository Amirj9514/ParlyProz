import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { PlayerStatsService } from '../../../Shared/services/player-stats.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [TableModule , CommonModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent implements OnInit {
  players: any[] = [];
  constructor(private playerS:PlayerStatsService){}

  ngOnInit(): void {
    this.getPlayerList();
  }

  getPlayerList() {
    this.players =  this.playerS.getPlayerData(15 , 'desc');
  }

  roundValue(value: number) {
    return (value);
  }

}
