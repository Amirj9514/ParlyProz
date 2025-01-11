import { Component } from '@angular/core';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [SidebarComponent , HeaderComponent , SelectButtonModule , FormsModule],
  templateUrl: './players.component.html',
  styleUrl: './players.component.scss'
})
export class PlayersComponent {
  value: number = 1;

  paymentOptions: any[] = [
      { name: 'L5', value: 1 },
      { name: 'L10', value: 2 },
      { name: 'L15', value: 3 },
      { name: '2024', value: 4 }
  ];

}
