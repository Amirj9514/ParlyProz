import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SharedService } from '../../Shared/services/shared.service';
import { DetailsCardComponent } from "./details-card/details-card.component";
import { PlayerService } from '../../Shared/services/player.service';
import {MainCompareGraphComponent} from '../single-player-detail/main-compare-graph/main-compare-graph.component'
import {TableComponent} from '../single-player-detail/table/table.component';
import { ButtonModule } from 'primeng/button';
import { forkJoin } from 'rxjs';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-single-player-detail',
  standalone:true,
  imports: [DetailsCardComponent , MainCompareGraphComponent ,TableComponent , ButtonModule , SkeletonModule],
  templateUrl: './single-player-detail.component.html',
  styleUrl: './single-player-detail.component.scss'
})
export class SinglePlayerDetailComponent implements OnInit {
  @Input() selectedPlayerId: number = 0;
  @Output() onClose = new EventEmitter();
  playerDetail: any[] =[];
  playerDetailLoader:boolean = false;

  constructor(private sharedS:SharedService , private playerS:PlayerService){}

  ngOnInit(): void {
    this.getPlayerDetailWithLineStats();
  }

  getPlayerDetailWithLineStats() {
    this.playerDetailLoader = true;
    const lineStats$ = this.sharedS.sendGetRequest(`nba/stat/fields/lines`);
    const playerDetail$ = this.sharedS.sendGetRequest(`nba/players/stats/${this.selectedPlayerId}?season=2024-25`); // Example of another API call
  
    forkJoin([lineStats$, playerDetail$]).subscribe({
      next: ([lineStatsRes, playerDetailRes]: any) => {
        this.playerDetailLoader = false;
        if (lineStatsRes.status === 200 && playerDetailRes.status === 200) {
          // Handle the response from the first API
          this.playerS.setLineStats(lineStatsRes.body);
  
          // Handle the response from the second API
          this.playerDetail = playerDetailRes.body ?? [];
          this.playerS.setPlayerData(this.playerDetail);
  
        }
      },
      error: (error) => {
        this.playerDetailLoader = false;
        console.error('There was an error!', error);
      },
    });
  }

  getPlayerDetails() {
    this.playerDetailLoader = true;
    this.sharedS.sendGetRequest(`nba/players/stats/${this.selectedPlayerId}?season=2024-25`).subscribe({
      next: (res:any) => {
        this.playerDetailLoader = false;
        if(res.status === 200) {
          this.playerDetail = res.body ?? [];
          this.playerS.setPlayerData(this.playerDetail);
        }
      },
      error: (error) => {
        this.playerDetailLoader = false;
        console.log(error);
      }
    })
  }

  goback(){
    this.onClose.emit();
  }

}
