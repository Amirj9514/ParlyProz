import { Component, OnInit } from '@angular/core';
import { SvgIconDirective } from '../../Shared/directives/svg-icon.directive';
import { PlayerService } from '../../Shared/services/player.service';

@Component({
  selector: 'app-player-profile',
  standalone: true,
  imports: [SvgIconDirective],
  templateUrl: './player-profile.component.html',
  styleUrl: './player-profile.component.scss'
})
export class PlayerProfileComponent implements OnInit {
  playerProfile:any;
  constructor(private playerS:PlayerService) { }

  ngOnInit(): void {
    this.getPlayerProfile();
  }

  getPlayerProfile(){
    this.playerProfile =this.playerS.preparePlayerProfile();
    console.log(this.playerProfile);
    
  }


  getInitials(fullName:string): string {
    return fullName
      .split(' ')              // Split the name by spaces
      .map(name => name[0])    // Take the first letter of each part
      .join('')                // Combine the initials
      .toUpperCase();          // Convert to uppercase
  }
}
