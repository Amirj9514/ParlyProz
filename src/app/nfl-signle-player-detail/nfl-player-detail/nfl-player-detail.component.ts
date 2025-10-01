import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TabsModule } from 'primeng/tabs';
import { debounceTime, Subject } from 'rxjs';
// import { NhlService } from '../../../Shared/services/nhl.service';
import * as d3 from 'd3';
import { NflService } from '../../../Shared/services/nfl.service';
import { CommonService } from '../../../Shared/services/common.service';

@Component({
  selector: 'app-nfl-player-detail',
  standalone: true,
  imports: [
    TabsModule,
    SelectButtonModule,
    CommonModule,
    FormsModule,
    InputGroupModule,
    InputGroupAddonModule,
    ButtonModule,
  ],
  templateUrl: './nfl-player-detail.component.html',
  styleUrl: './nfl-player-detail.component.scss',
})
export class NflPlayerDetailComponent {
  @ViewChild('chart', { static: true }) chartContainer!: ElementRef;
  @Input() selectedPlayerDetail: any;

  thresholdValue: number = 0;
  statsList: any[] = [];
  selectedStats: any;
  value: any = 2;
  debounceSubject = new Subject<number>();
  activeColor: string = 'success';

  defaultSelect: any;

  graphData: any[] = [];
  paymentOptions: any[] = [
    { name: 'L5', value: 1, avg: 0, hr: 0 },
    { name: 'L10', value: 2, avg: 0, hr: 0 },
    { name: 'L15', value: 3, avg: 0, hr: 0 },
    { name: 'L20', value: 4, avg: 0, hr: 0 },
  ];

  constructor(private nhlService: NflService, public commonS: CommonService) {}

  ngOnInit() {
    if (this.commonS.isPremiumUser()) {
      this.paymentOptions = [
        ...this.paymentOptions,
        { name: 'L30', value: 6, avg: 0, hr: 0 },
        { name: 'All', value: 7, avg: 0, hr: 0 },
        { name: '2025', value: 2025, avg: 0, hr: 0 },
        { name: '2024', value: 2024, avg: 0, hr: 0 },
        { name: 'H2H', value: 'H2H', avg: 0, hr: 0 },
      ];
    }

    setTimeout(() => {
      this.statsList = this.nhlService.getStatsList();
      let newStatsList: any[] = [];
      const playersStats: any[] = this.nhlService.getPlayerData(20) ?? [];
      this.statsList.map((stat, index) => {
        // if (stat.id !== 'H+R+RBI') {
        const statName = this.nhlService.getStatsKeyByStatsId(stat.id);
        let isStatFound = false;
        for (const player of playersStats) {
          if (player[statName.key] || player[statName.key] === 0) {
            isStatFound = true;
            break;
          }
        }

        if (isStatFound) {
          if (newStatsList.length && newStatsList.length == 1) {
            const line = this.nhlService.returnShortName(statName.key);
            this.defaultSelect = line;
          }
          newStatsList.push(stat);
        }
        // }
      });

      // for (const stats of newStatsList) {
      //   if (stats.id === 'HITS' || stats.id === 'RUNS' || stats.id === 'RBIS') {
      //     newStatsList.push({
      //       id: 'H+R+RBI',
      //       name: 'Hits+Runs+RBIs',
      //     });
      //     break;
      //   }
      // }
      this.statsList = newStatsList;

      const statsId =
        this.nhlService.getStatsIdByKey(this.selectedPlayerDetail?.field) ??
        this.defaultSelect ??
        'REC';
      this.selectedStats = this.statsList.find((stat) => stat.id === statsId);
      const line = this.selectedPlayerDetail?.line ?? 0;

      this.thresholdValue = this.selectedPlayerDetail?.line ?? 0;
      this.getStatsList(statsId || this.defaultSelect || 'REC', 10, line);
    }, 100);

    //

    this.debounceSubject.pipe(debounceTime(500)).subscribe((val) => {
      this.thresholdValue = val ? val : 0;
      this.getStatsList(
        this.selectedStats.id,
        this.value * 5,
        this.thresholdValue
      );
    });
  }

  getStatsList(stats: string, numberOfStats: number, line?: number) {
    const activeStats = stats;

    if (line) {
      this.thresholdValue = line;
    } else {
      const lines = this.nhlService.getStatLineValuesByName(activeStats);
      this.thresholdValue = lines.length ? lines[0] : 0;
    }
    
    this.graphData = this.nhlService.preparePlayerStatsGraphData(
      activeStats,
      numberOfStats,
      this.selectedPlayerDetail?.opponent
    );

    const calStats = this.nhlService.calculatePlayerAvgAndHR(
      this.thresholdValue,
      activeStats,
      this.selectedPlayerDetail?.opponent
    );

    this.paymentOptions.map((option) => {
      option.avg = calStats[option.name]?.average ?? 0;
      option.hr = calStats[option.name]?.percentageAboveBaseLine ?? 0;
    });

    const hr = this.paymentOptions[this.value - 1]?.hr ?? 0;
    if (hr >= 50) {
      this.activeColor = 'success';
    } else {
      this.activeColor = 'danger';
    }

    // if (activeStats === '3PM') {
    //   this.createChartPM();
    //   return;
    // }
    this.createChart();
  }

  private createChart() {
    const data: any[] = this.graphData;

    const containerWidth = this.chartContainer.nativeElement.clientWidth || 500;
    const width = containerWidth - 30;
    const height = 320;
    const margin = { top: 40, right: 10, bottom: 40, left: 10 };
    const barRadius = 8;
    const lineValue = this.thresholdValue;

    d3.select(this.chartContainer.nativeElement).selectAll('*').remove();
    const tooltip = d3
      .select(this.chartContainer.nativeElement)
      .append('div')
      .style('position', 'absolute')
      // .style('background', 'white')
      .style('box-shadow', '0px 4px 8px rgba(0, 0, 0, 0.2)')
      .style('border-radius', '8px')
      .style('font-size', '12px')
      .style('display', 'none')
      .style('pointer-events', 'none');
    const svg = d3
      .select(this.chartContainer.nativeElement)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${45})`);

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.category))
      .range([0, width])
      .padding(0.2);

    const allKeys = Array.from(
      new Set(data.flatMap((d) => Object.keys(d.values)))
    );
    const maxYValue =
      d3.max(data, (d) => d3.sum(allKeys, (key) => d.values[key])) || 0;

    const yScale = d3.scaleLinear().domain([0, maxYValue]).range([height, 0]);

    const barsGroup = svg.append('g').attr('class', 'bars-group');

    barsGroup
      .selectAll('.bar-group')
      .data(data)
      .enter()
      .append('g')
      .each(function (d) {
        let yOffset = height;
        const x = xScale(d.category)!;
        const totalValue = d3.sum(allKeys, (key) => d.values[key]);

        if (totalValue === 0) {
          d3.select(this)
            .append('path')
            .attr(
              'd',
              `M ${x},${height - 18 + barRadius} 
                   A ${barRadius},${barRadius} 0 0 1 ${x + barRadius},${
                height - 18
              } 
                   H ${x + xScale.bandwidth() - barRadius} 
                   A ${barRadius},${barRadius} 0 0 1 ${
                x + xScale.bandwidth()
              },${height - 18 + barRadius} 
                   V ${height} H ${x} Z`
            )

            .attr('fill', '#e74c3c');

          d3.select(this)
            .append('text')
            .text('0')
            .attr('x', x + xScale.bandwidth() / 2)
            .attr('y', height - 25)
            .attr('text-anchor', 'middle')
            .attr('fill', 'white')
            .attr('font-size', '12px')
            .attr('font-weight', 'bold');
          return;
        }

        const colorAbove = d3
          .scaleOrdinal()
          .domain(allKeys)
          .range(['#2ecc71', '#27ae60', '#1e8449']);
        const colorBelow = d3
          .scaleOrdinal()
          .domain(allKeys)
          .range(['#e74c3c', '#c0392b', '#922b21']);

        allKeys.forEach((key, index) => {
          const value = d.values[key];
          if (value === 0) return;

          let barHeight = (value / maxYValue) * height;
          // barHeight = Math.max(barHeight, 10); // Ensure minimum visibility

          const y = yOffset - barHeight;
          yOffset = y;

          const nonZeroStacks = allKeys.filter((key) => d.values[key] > 0);
          const isLastStack = key === nonZeroStacks[nonZeroStacks.length - 1]; // Check if this is the topmost stack
          const barColor =
            totalValue >= lineValue ? colorAbove(key) : colorBelow(key);

          const barPath = isLastStack
            ? `M ${x},${y + barRadius} 
                   A ${barRadius},${barRadius} 0 0 1 ${x + barRadius},${y} 
                   H ${x + xScale.bandwidth() - barRadius} 
                   A ${barRadius},${barRadius} 0 0 1 ${
                x + xScale.bandwidth()
              },${y + barRadius} 
                   V ${y + barHeight} H ${x} Z`
            : `M ${x},${y} H ${x + xScale.bandwidth()} V ${
                y + barHeight
              } H ${x} Z`;

          d3.select(this)
            .append('path')
            .attr('d', barPath)
            .attr('fill', barColor as string)
            .on('mouseover', function (event) {
              const statsHtml = d.data?.value
                .map(
                  (stat: any) => `
                    <div style="display: flex; justify-content: space-between;">
                      <span style="font-size: 12px; opacity: 0.8;">${
                        stat?.name || 'N/A'
                      }</span>
                      <span style="font-size: 12px; font-weight: bold;">${
                        stat?.value || 'N/A'
                      }</span>
                    </div>`
                )
                .join('');
              const tooltipHtml = `
                  <div class="tooltipBody">
                    <div class="flex align-items-center" >
                      📅 ${d.data?.date || 'N/A'} &nbsp; @ ${
                d.data?.opponent || 'N/A'
              }
                    </div>
                    
                    <hr style="border: 0.5px solid rgba(255, 255, 255, 0.1); margin: 8px 0;">
                    ${statsHtml}
                   
                  </div>`;
              tooltip
                .html(tooltipHtml)
                .style('display', 'block')
                .style('left', `${event.pageX - 105}px`)
                .style('top', `${event.pageY - 105}px`);
            })
            .on('mousemove', function (event) {
              tooltip
                .style('left', `${event.pageX - 105}px`)
                .style('top', `${event.pageY - 105}px`);
            })
            .on('mouseleave', function () {
              tooltip.style('display', 'none');
            });

          d3.select(this)
            .append('text')
            .text(`${value} ${key}`)
            .attr('x', x + xScale.bandwidth() / 2)
            .attr('y', y + barHeight / 2 + 5)
            .attr('text-anchor', 'middle')
            .attr('fill', 'white')
            .attr('font-size', '8px')
            .attr('font-weight', 'bold')
            .style('display', allKeys.length > 1 ? 'block' : 'none')
            .attr('class', 'hide');
        });

        d3.select(this)
          .append('text')
          .text(totalValue)
          .attr('x', x + xScale.bandwidth() / 2)
          .attr('y', yOffset - 10)
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold');
        // .style('display', allKeys.length > 1 ? 'block' : 'none');
      });

    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(() => ''))
      .selectAll('text')
      .attr('class', 'hide')
      .attr('text-anchor', 'middle')
      .each(function (d: any) {
        const [date, team] = d.split('_');
        d3.select(this)
          .text('')
          .append('tspan')
          .attr('x', 0)
          .attr('dy', '0.6em')
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .text(team);

        d3.select(this)
          .append('tspan')
          .attr('x', 0)
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .attr('dy', '1.2em')
          .text(date);
      });

    // svg.append('g').call(d3.axisLeft(yScale));

    svg
      .append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', yScale(lineValue))
      .attr('y2', yScale(lineValue))
      .attr('stroke', 'gray')
      .attr('stroke-dasharray', '10,10')
      .attr('stroke-width', 2);
  }

  onStatsChange(event: any) {
    this.selectedStats = event;
     let numberOfStats = 0;
    if (this.value == 2024 || this.value == 2025) {
      numberOfStats = this.value;
    }else if(this.value === 'H2H') {
      numberOfStats = 100;
    } else {
      numberOfStats = this.value * 5;
    }
    
    this.getStatsList(event.id, numberOfStats);
  }

  onPlayerMatchChange(event: any) {
    let numberOfStats = 0;
    if (event == 2024 || event == 2025) {
      numberOfStats = event;
    }else if(event=== 'H2H') {
      numberOfStats = 100;  
    }else{
      numberOfStats = event * 5;
    }
    this.getStatsList(
      this.selectedStats.id,
      numberOfStats,
      this.thresholdValue
    );
  }

  handelLineChange(type: 'plus' | 'minus') {
    const baseVal = 0.5;
    if (type === 'plus') {
      this.thresholdValue = this.thresholdValue + baseVal;
    } else if (type === 'minus' && this.thresholdValue !== 0) {
      this.thresholdValue = this.thresholdValue - baseVal;
    }
    this.getStatsList(
      this.selectedStats.id,
      this.value * 5,
      this.thresholdValue
    );
  }
  onLineValueChange(event: KeyboardEvent) {
    let input = (event.target as HTMLInputElement).value;

    input = input.replace(/[^0-9.]/g, '').replace(/^(\d*\.\d?).*$/, '$1');
    if (!/^0(\.|$)/.test(input)) {
      input = input.replace(/^0+/, '');
    }
    (event.target as HTMLInputElement).value = input;
    const lineVal = parseFloat(input ?? '0');
    // Emit debounced value
    this.debounceSubject.next(lineVal);
  }
}
