import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  OnInit,
  PLATFORM_ID,
  ChangeDetectorRef,
  inject,
  effect,
} from '@angular/core';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-card2',
  standalone: true,
  imports: [ChartModule],
  templateUrl: './card2.component.html',
  styleUrl: './card2.component.scss',
})
export class Card2Component {
  data: any;

  options: any;

  platformId = inject(PLATFORM_ID);
  constructor(private cd: ChangeDetectorRef) {}
  ngOnInit() {
    this.initChart();
  }

  initChart() {
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');

      this.data = {
        labels: ['Home', 'Away', ],
        datasets: [
          {
            data: [94.7, 5.4],
            backgroundColor: [
              '#004991',
          '#4B1869',
              documentStyle.getPropertyValue('--p-gray-500'),
            ],
            hoverBackgroundColor: [
              '#004991',
              '#4B1869',
              documentStyle.getPropertyValue('--p-gray-400'),
            ],
          },
        ],
      };

      this.options = {
        cutout: '60%',
        plugins: {
          legend: {
            labels: {
              color: textColor,
            },
          },
        },
      };
      this.cd.markForCheck();
    }
  }
}
