import { Component } from '@angular/core';
import { SvgIconDirective } from '../../Shared/directives/svg-icon.directive';

@Component({
  selector: 'app-player-profile',
  standalone: true,
  imports: [SvgIconDirective],
  templateUrl: './player-profile.component.html',
  styleUrl: './player-profile.component.scss'
})
export class PlayerProfileComponent {

}
