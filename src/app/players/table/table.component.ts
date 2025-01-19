import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { PlayerService } from '../../Shared/services/player.service';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [TableModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent implements OnInit {
  players: any[] = [];
  constructor(private playerS:PlayerService){}

  ngOnInit(): void {
    this.getPlayerList();
  }


  getPlayerList() {
    this.players =  this.playerS.getPlayers(15);
    console.log(this.players[0]);
  }

  roundValue(value: number) {
    return (value).toFixed(1);
  }
 
}
