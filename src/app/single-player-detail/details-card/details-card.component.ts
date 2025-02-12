import { Component } from '@angular/core';
import { PlayerService } from '../../../Shared/services/player.service';
import { SvgIconDirective } from '../../../Shared/directives/svg-icon.directive';

@Component({
  selector: 'app-details-card',
  standalone: true,
  imports: [SvgIconDirective],
  templateUrl: './details-card.component.html',
  styleUrl: './details-card.component.scss'
})
export class DetailsCardComponent {
  playerProfile:any;
  constructor(private playerS:PlayerService) { }

  ngOnInit(): void {
    this.getPlayerProfile();
  }

  getPlayerProfile(){
    this.playerProfile =this.playerS.preparePlayerProfile();
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
