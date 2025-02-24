import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AutoLogoutService } from '../Shared/services/auto-logout.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-root',
  standalone:true,
  imports: [RouterOutlet , DialogModule , ButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(public autoLogoutService: AutoLogoutService){}
  title = 'parlyProz';
}
