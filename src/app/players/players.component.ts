
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, effect, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Graph2Component } from './graph2/graph2.component';
import { TableComponent } from "./table/table.component";
import { Card1Component } from "./card1/card1.component";
import { Card2Component } from "./card2/card2.component";
import { Card3Component } from "./card3/card3.component";
import { PlayerProfileComponent } from "./player-profile/player-profile.component";
import { PlayerService } from '../Shared/services/player.service';
import { registerables, Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(...registerables, ChartDataLabels);
@Component({
  selector: 'app-players',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, SelectButtonModule, FormsModule, ChartModule, Graph2Component, TableComponent, Card1Component, Card2Component, Card3Component, PlayerProfileComponent],
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


  basicData: any;

    basicOptions: any;

    platformId = inject(PLATFORM_ID);

    constructor(private cd: ChangeDetectorRef, private playerS:PlayerService) {}


    ngOnInit() {
        this.getSinglePlayerStas();
        
    }

    initChart(data:any) {
        if (isPlatformBrowser(this.platformId)) {
            const documentStyle = getComputedStyle(document.documentElement);
            const textColor = documentStyle.getPropertyValue('--p-text-color');
            const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
            const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

            this.basicData = data;

            this.basicOptions = {
                plugins: {
                    legend: {
                        display:false,
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
                            color: textColorSecondary
                        },
                        grid: {
                            color: surfaceBorder,
                            drawBorder: false,
                            display: false
                        }
                    },
                    y: {
                        stacked: true,
                        ticks: {
                            color: textColorSecondary
                        },
                        grid: {
                            color: surfaceBorder,
                            drawBorder: false,
                            
                        }
                    }
                },
            };
            this.cd.markForCheck()
        }
    }

    getSinglePlayerStas(){
      const {players , graphData } =  this.playerS.applyFilterByPlayerStats('PRA' , 15);

      console.log(graphData);
      
       this.initChart(graphData);
       
    }


  
}
