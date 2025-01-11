
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

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, SelectButtonModule, FormsModule, ChartModule, Graph2Component, TableComponent, Card1Component, Card2Component, Card3Component],
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

    constructor(private cd: ChangeDetectorRef) {}


    ngOnInit() {
        this.initChart();
    }

    initChart() {
        if (isPlatformBrowser(this.platformId)) {
            const documentStyle = getComputedStyle(document.documentElement);
            const textColor = documentStyle.getPropertyValue('--p-text-color');
            const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
            const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

            this.basicData = {
                labels: ['11/26/24 MSU', '11/26/24 MSU', '11/26/24 MSU', '11/26/24 MSU' , '11/26/24 MSU','11/26/24 MSU', '11/26/24 MSU', '11/26/24 MSU', '11/26/24 MSU' , '11/26/24 MSU'],
                datasets: [
                    {
                        label: 'Matches',
                        data: [540, 325, 702, 620 , 420, 300, 500, 100, 200, 300],
                        backgroundColor: [
                            '#10B981',
                        ],
                        borderColor: ['#10B981'],
                        borderWidth: 1,
                    },
                ],
            };

            this.basicOptions = {
                plugins: {
                    legend: {
                        labels: {
                            color: textColor,
                        },
                    },
                },
                scales: {
                    x: {
                        ticks: {
                            color: textColorSecondary,
                        },
                        grid: {
                            color: surfaceBorder,
                        },
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: textColorSecondary,
                        },
                        grid: {
                            color: surfaceBorder,
                        },
                    },
                },
            };
            this.cd.markForCheck()
        }
    }

}
