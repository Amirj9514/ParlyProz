import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ChartModule } from 'primeng/chart';
import { TabsModule } from 'primeng/tabs';
import { PlayerService } from '../../../Shared/services/player.service';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ButtonModule } from 'primeng/button';
import { debounceTime } from 'rxjs';
@Component({
  selector: 'app-main-compare-graph',
  standalone: true,
  imports: [
    SelectButtonModule,
    FormsModule,
    ChartModule,
    TabsModule,
    InputGroupModule,
    InputGroupAddonModule,
    ButtonModule,
    CommonModule,
    ReactiveFormsModule,
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
  lineValueControl = new FormControl<any>('');
  paymentOptions: any[] = [
    { name: 'L5', value: 1, avg: 0, hr: 0 },
    { name: 'L10', value: 2, avg: 0, hr: 0 },
    { name: 'L15', value: 3, avg: 0, hr: 0 },
    { name: 'L20', value: 4, avg: 0, hr: 0 },
  ];

  basicData: any;
  basicOptions: any;
  platformId = inject(PLATFORM_ID);
  constructor(private cd: ChangeDetectorRef, private playerS: PlayerService) {}

  ngOnInit(): void {
    const lines = this.playerS.getStatLineValuesByName('MIN');

    this.lineVal = lines.length ? lines[0] : 0;
    this.lineValueControl.setValue(this.lineVal);
    this.getStatsList();
    const calStats = this.playerS.calculatePlayerAvgAndHR(null, 'MIN');
    this.paymentOptions.map((option) => {
      option.avg = calStats[option.name].average;
      option.hr = calStats[option.name].percentageAboveBaseLine;
    });

    this.lineValueControl.valueChanges
      .pipe(debounceTime(500))
      .subscribe((value) => {
        const cleanedValue = this.cleanInput(value ?? '');
        this.lineValueControl.setValue(cleanedValue, { emitEvent: false });
        this.onLineValueChange(cleanedValue);
      });
  }

  getStatsList() {
    this.statsList = this.playerS.getStatsList();
    this.selectedStats = this.statsList[0];

    if (this.statsList.length) {
      this.getSinglePlayerStas(
        this.selectedStats.id,
        this.numberOfPlayers,
        this.lineVal
      );
    }
  }

  onStatsChange(stats: any) {
    this.selectedStats = stats;
    const lines = this.playerS.getStatLineValuesByName(stats.id);
    this.lineVal = lines.length ? lines[0] : 0;
    this.lineValueControl.setValue(this.lineVal);
    this.getSinglePlayerStas(stats.id, this.numberOfPlayers, this.lineVal);
    const calStats = this.playerS.calculatePlayerAvgAndHR(
      this.lineVal,
      this.selectedStats?.id
    );
    this.paymentOptions.map((option) => {
      option.avg = calStats[option.name].average;
      option.hr = calStats[option.name].percentageAboveBaseLine;
    });
  }
  onLineValueChange(value: any) {
    if (value) {
      const val = parseFloat(value);
      this.lineVal = val;
      this.getSinglePlayerStas(
        this.selectedStats.id,
        this.numberOfPlayers,
        this.lineVal
      );
    } else {
      this.lineVal = 0;
      this.lineValueControl.setValue(this.lineVal);
      
    }
    
    const calStats = this.playerS.calculatePlayerAvgAndHR(
      this.lineVal,
      this.selectedStats?.id
    );
    this.paymentOptions.forEach((option) => {
      option.avg = calStats[option.name]?.average || 0;
      option.hr = calStats[option.name]?.percentageAboveBaseLine || 0;
    });
  }

  cleanInput(value: string): string {
    if (!value) return '';

    // Allow only numbers and a single decimal point with max one digit after
    const cleanedValue = value
      .replace(/[^0-9.]/g, '') // Remove non-numeric characters except '.'
      .replace(/^(\d*\.?\d?).*$/, '$1'); // Allow only one decimal place

    return cleanedValue;
  }

  handelLineChange(type: 'plus' | 'minus') {
    const baseVal = 0.5;
    if (type === 'plus') {
      this.lineVal = this.lineVal + baseVal;
    } else if (type === 'minus' && this.lineVal !== 0) {
      this.lineVal = this.lineVal - baseVal;
    }
    this.lineValueControl.setValue(this.lineVal);
    this.getSinglePlayerStas(
      this.selectedStats.id,
      this.numberOfPlayers,
      this.lineVal
    );
    const calStats = this.playerS.calculatePlayerAvgAndHR(
      this.lineVal,
      this.selectedStats?.id
    );
    this.paymentOptions.map((option) => {
      option.avg = calStats[option.name].average;
      option.hr = calStats[option.name].percentageAboveBaseLine;
    });
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
    let totalBlock = 0.5;
    let maxBlock: number = 0;
    if (data.datasets.length > 2) {
      const barDatasets = data.datasets.filter(
        (dataset: any) => dataset.type === 'bar'
      );
      const total = barDatasets.reduce(
        (acc: any, curr: any) =>
          acc.map((num: any, index: any) => num + (curr.data[index] || 0)),
        Array(barDatasets[0].data.length).fill(0)
      );
      maxBlock = Math.max(...total);

      if (maxBlock > 15) {
        totalBlock = 1;
      } else if (maxBlock > 40) {
        totalBlock = 2;
      } else if (maxBlock > 60) {
        totalBlock = 3;
      } else if (maxBlock > 80) {
        totalBlock = 4;
      } else if (maxBlock > 100) {
        totalBlock = 5;
      } else if (maxBlock > 120) {
        totalBlock = 6;
      }
      const totalData = data.datasets[0].data.map(
        (value: any, index: any) => totalBlock
      );
      const totalBars = {
        type: 'bar',
        label: 'Total',
        backgroundColor: 'transparent', // Hide column
        borderColor: 'transparent', // Hide border
        borderWidth: 0, // No border
        data: totalData,
        correctData: totalData,
        datalabels: {
          color: '#000', // Keep labels visible
          font: {
            weight: 'bold',
          },
        },
      };

      data.datasets.push(totalBars);
    }

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
          tooltip: {
            callbacks: {
              label: function (tooltipItem: any) {
                let value = tooltipItem.raw;
                return `${tooltipItem?.dataset?.label}: ${value}`;
              },
            },
          },

          datalabels: {
            display: (context: any) => {
              return context.dataset.type === 'bar';
            },
            color: '#fff', // Label color
            anchor: 'center', // Label position
            align: 'center', // Label alignment
            formatter: (value: any, context: any) => {
              const datasetIndex = context.datasetIndex;
              const dataIndex = context.dataIndex;
              const datasets = context.chart.data.datasets;
              // Calculate total for the stacked bars
              let total = datasets.reduce((sum: any, dataset: any) => {
                if (dataset.type !== 'line') {
                  return sum + (dataset.correctData[dataIndex] || 0);
                }
                return sum; // Skip line datasets
              }, 0);
              if (datasetIndex === datasets.length - 1) {
                if (datasets.length > 2) {
                  return [total - totalBlock];
                } else {
                  return [value];
                }
              } else if (value != 0) {
                return value;
              } else {
                return '';
              }
            },
          },
        },
        scales: {
          x: {
            stacked: true,
            ticks: {
              color: textColorSecondary,
              formatter: (value: any) => {
                return value.split('\n'); // Ensures labels break into multiple lines
              },
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
              display: false, // Hides Y-axis labels (numbers)
            },
            grid: {
              drawBorder: false,
              display: false,
              drawTicks: false, // Hides tick marks on Y-axis
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
