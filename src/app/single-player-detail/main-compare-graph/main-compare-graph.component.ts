import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ChartModule } from 'primeng/chart';
import { TabsModule } from 'primeng/tabs';
import { InputNumberModule } from 'primeng/inputnumber';
import { PlayerService } from '../../../Shared/services/player.service';

@Component({
  selector: 'app-main-compare-graph',
  standalone: true,
  imports: [
    SelectButtonModule,
    FormsModule,
    ChartModule,
    TabsModule,
    InputNumberModule,
  ],
  templateUrl: './main-compare-graph.component.html',
  styleUrl: './main-compare-graph.component.scss',
})
export class MainCompareGraphComponent implements OnInit {
  value: number = 3;
  numberOfPlayers: number = 15;
  lineVal: number = 0;

  statsList: any[] = [];
  selectedStats: any;
  paymentOptions: any[] = [
    { name: 'L5', value: 1 },
    { name: 'L10', value: 2 },
    { name: 'L15', value: 3 },
    { name: 'L20', value: 4 },
  ];

  basicData: any;
  basicOptions: any;
  platformId = inject(PLATFORM_ID);
  constructor(private cd: ChangeDetectorRef, private playerS: PlayerService) {}

  ngOnInit(): void {
    this.lineVal = this.playerS.getStatLineValuesByName('PTS');
    this.getStatsList();
  }

  getStatsList() {
    this.statsList = this.playerS.getStatsList();
    this.selectedStats = this.statsList[0];

    if(this.statsList.length){
      this.getSinglePlayerStas(
        this.selectedStats.id,
        this.numberOfPlayers,
        this.lineVal
      );
    }
      // this.getSinglePlayerStas(
      //   this.selectedStats.id,
      //   this.numberOfPlayers,
      //   this.lineVal
      // );
  
  }

  onStatsChange(stats: any) {
    this.selectedStats = stats;
    this.lineVal = this.playerS.getStatLineValuesByName(stats.id);
    this.getSinglePlayerStas(stats.id, this.numberOfPlayers, this.lineVal);
  }

  onLineValueChange(event: any) {
    this.lineVal = event;
    this.getSinglePlayerStas(
      this.selectedStats.id,
      this.numberOfPlayers,
      this.lineVal
    );
  }

  onPlayerMatchChange(event: any) {
    switch (event) {
      case 1:
        this.numberOfPlayers = 5;
        break;
      case 2:
        this.numberOfPlayers = 10;
        break;
      case 3:
        this.numberOfPlayers = 15;
        break;
      case 4:
        this.numberOfPlayers = 20;
        break;
      default:
        break;
    }

    this.getSinglePlayerStas(
      this.selectedStats.id,
      this.numberOfPlayers,
      this.lineVal
    );
  }

  initChart(data: any) {
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');
      const textColorSecondary = documentStyle.getPropertyValue(
        '--p-text-muted-color'
      );
      const surfaceBorder = documentStyle.getPropertyValue(
        '--p-content-border-color'
      );

      this.basicData = data;

      this.basicOptions = {
        plugins: {
          legend: {
            display: false,
            labels: {
              color: textColor,
            },
          },

          datalabels: {
            display: (context: any) => {
              // Only show labels for bar datasets
              return context.dataset.type === 'bar';
            },
            color: '#fff', // Label color
            anchor: 'center', // Label position
            align: 'center', // Label alignment
            formatter: (value: any) => value, // Display the value

            // formatter: (value: any, context: any) => {
            //     const datasetLabel = context.dataset.label || ''; // Get the dataset label
            //     return `${datasetLabel}: ${value}`; // Combine label and value
            // },
          },
        },
        scales: {
          x: {
            stacked: true,
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false,
              display: false,
            },
          },
          y: {
            stacked: true,
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false,
            },
          },
        },
      };
      this.cd.markForCheck();
    }
  }

  getSinglePlayerStas(stats: any, numOfPlayers: number, lineVal: number) {
    const { players, graphData } = this.playerS.applyFilterByPlayerStats(
      stats,
      numOfPlayers,
      lineVal
    );
    this.initChart(graphData);
  }
}
