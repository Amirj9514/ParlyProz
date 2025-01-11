import { Component } from '@angular/core';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [SidebarComponent , HeaderComponent],
  templateUrl: './players.component.html',
  styleUrl: './players.component.scss'
})
export class PlayersComponent {

}
