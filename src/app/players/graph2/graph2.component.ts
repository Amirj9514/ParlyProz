
import { ChartModule } from 'primeng/chart';
import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, effect, inject, OnInit, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-graph2',
  standalone: true,
  imports: [ChartModule],
  templateUrl: './graph2.component.html',
  styleUrl: './graph2.component.scss'
})
export class Graph2Component {
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
                          label: 'Statistics',
                          data: [540, 325, 702, 620 , 420, 300, 500, 100, 200, 300],
                          backgroundColor: [
                              '#6B7280',
                          ],
                          borderColor: ['#6B7280'],
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
