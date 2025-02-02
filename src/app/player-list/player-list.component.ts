import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../Shared/services/shared.service';
import { HeaderComponent } from "../projections/header/header.component";
import { JerseyDirective } from '../../Shared/directives/jersey.directive';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import {SinglePlayerDetailComponent} from '../single-player-detail/single-player-detail.component'
import { ComingSoonComponent } from "../projections/coming-soon/coming-soon.component";

@Component({
  selector: 'app-player-list',
  standalone: true,
  imports: [HeaderComponent, JerseyDirective, TagModule, SkeletonModule, SinglePlayerDetailComponent, ComingSoonComponent],
  templateUrl: './player-list.component.html',
  styleUrl: './player-list.component.scss'
})
export class PlayerListComponent implements OnInit {

  selectedGame: string = 'nba';
  playerList: any[] = [];
  playerListLoader: boolean = false;
  showComingSoon: boolean = false;

  seletedPlayer: number =0;

  constructor(private sharedS: SharedService) {}
  ngOnInit(): void {
    this.getPlayersList();
  }

  onGameChange(event: any) {
    this.showComingSoon = false;
    if(event){
      this.selectedGame = event;
      this.getPlayersList();
      return;
    }

    this.showComingSoon = true;

  }

  getPlayersList() {
    this.playerListLoader = true;
    this.sharedS.sendGetRequest(`${this.selectedGame}/players/list`).subscribe({
      next: (res: any) => {
        this.playerListLoader = false;
        if (res.status === 200) {
          console.log(res.body);
          
          this.playerList = res.body ?? [];
        }
      },
      error: (error) => {
        this.playerListLoader = false;
      },
    });
  }
}
