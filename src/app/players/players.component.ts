import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import {
  Component,
} from '@angular/core';
import { TableComponent } from './table/table.component';
import { PlayerProfileComponent } from './player-profile/player-profile.component';
import { PlayerService } from '../Shared/services/player.service';
import { registerables, Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { MainCompareGraphComponent } from "./main-compare-graph/main-compare-graph.component";
import { ActivatedRoute } from '@angular/router';
import { SharedService } from '../Shared/services/shared.service';
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
    TableComponent,
    PlayerProfileComponent,
    MainCompareGraphComponent
],
  templateUrl: './players.component.html',
  styleUrl: './players.component.scss',
})
export class PlayersComponent {
  value: number = 1;
  paramValue:any;
  playerDetailLoader:boolean = false;
  playerData:any[] = [];

  constructor(private route: ActivatedRoute , private sharedS:SharedService , private playerS:PlayerService) {}
  ngOnInit() {
    this.getParamID();
    this.getPlayerData();
  }

  getParamID() {
    this.route.paramMap.subscribe((params) => {
      this.paramValue = params.get('id');
    });
  }


  getPlayerData() {
    this.playerDetailLoader = true;
    this.sharedS.sendGetRequest(`nba/players/stats/${this.paramValue}?season=2024-25`).subscribe({
      next: (res:any) => {
        this.playerDetailLoader = false;
        if(res.status === 200) {
          this.playerData = res.body ?? [];
          this.playerS.setPlayerData(res);
        }
      },
      error: (error) => {
        this.playerDetailLoader = false;
        console.error('There was an error!', error);
      }
    })
  }

}
