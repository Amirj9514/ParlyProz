import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { Graph2Component } from './graph2/graph2.component';
import { TableComponent } from './table/table.component';
import { Card1Component } from './card1/card1.component';
import { Card2Component } from './card2/card2.component';
import { Card3Component } from './card3/card3.component';
import { PlayerProfileComponent } from './player-profile/player-profile.component';
import { PlayerService } from '../Shared/services/player.service';
import { registerables, Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { MainCompareGraphComponent } from "./main-compare-graph/main-compare-graph.component";
Chart.register(...registerables, ChartDataLabels);
@Component({
  selector: 'app-players',
  standalone: true,
  imports: [
    SidebarComponent,
    HeaderComponent,
    SelectButtonModule,
    FormsModule,
    ChartModule,
    Graph2Component,
    TableComponent,
    PlayerProfileComponent,
    MainCompareGraphComponent
],
  templateUrl: './players.component.html',
  styleUrl: './players.component.scss',
})
export class PlayersComponent {
  value: number = 1;


  ngOnInit() {
    
  }

 
}
