import { Component, Input } from '@angular/core';
import { PlayerService } from '../../../Shared/services/player.service';
import { SvgIconDirective } from '../../../Shared/directives/svg-icon.directive';
import { SharedService } from '../../../Shared/services/shared.service';

@Component({
  selector: 'app-details-card',
  standalone: true,
  imports: [SvgIconDirective],
  templateUrl: './details-card.component.html',
  styleUrl: './details-card.component.scss'
})
export class DetailsCardComponent {
  @Input()selectedSport:string = 'mlb';
  playerProfile:any;
  playerDetail:any;
  constructor(private playerS:PlayerService , private sharedS:SharedService) { }

  ngOnInit(): void {
    this.getPlayerProfile();
  }

  getPlayerProfile(){
    this.playerProfile =this.playerS.preparePlayerProfile();
    this.getMaxScore();
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
