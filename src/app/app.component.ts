import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PlayerStatsGraphComponent } from "./single-player-detail/player-stats-graph/player-stats-graph.component";

@Component({
  selector: 'app-root',
  standalone:true,
  imports: [RouterOutlet, PlayerStatsGraphComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'parlyProz';
}
