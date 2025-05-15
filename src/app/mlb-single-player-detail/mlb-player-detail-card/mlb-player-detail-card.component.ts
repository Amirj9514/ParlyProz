import { Component, Input, OnInit } from '@angular/core';
import { PlayerService } from '../../../Shared/services/player.service';
import { SharedService } from '../../../Shared/services/shared.service';
import { NhlService } from '../../../Shared/services/nhl.service';
import { SvgIconDirective } from '../../../Shared/directives/svg-icon.directive';
import { MlbService } from '../../../Shared/services/mlb.service';

@Component({
  selector: 'app-mlb-player-detail-card',
  standalone: true,
  imports: [SvgIconDirective],
  templateUrl: './mlb-player-detail-card.component.html',
  styleUrl: './mlb-player-detail-card.component.scss'
})
export class MlbPlayerDetailCardComponent {
@Input()selectedSport:string = 'nba';
  playerProfile:any;
  playerDetail:any;
  allPlayerData:any[] = [];
  constructor(private playerS:PlayerService , private sharedS:SharedService , private nhlService:MlbService) { }
  
  ngOnInit(): void {
    this.getPlayerProfile();
  }

  getPlayerProfile(){
    this.playerProfile = this.nhlService.getPlayerProfile();
    this.allPlayerData = this.nhlService.getAllPlayerData() ?? [];

    if(this.playerProfile){
      this.getMaxScore();
    }
    // 
  }


  getMaxScore(){
    this.sharedS.sendGetRequest(`/${this.selectedSport}/players/${this.playerProfile?.player_id}/season-max?season=2024-25`).subscribe({
      next: (res:any) => {
        if(res.status === 200){ 
          this.playerDetail = res.body;
        }
      },
      error: (error) => {
        console.log(error);
      }
    })
  }


  getInitials(fullName:string): string {
    if(!fullName) return 'N/A';
    return fullName
      .split(' ')              // Split the name by spaces
      .map(name => name[0])    // Take the first letter of each part
      .join('')                // Combine the initials
      .toUpperCase();          // Convert to uppercase
  }
}
