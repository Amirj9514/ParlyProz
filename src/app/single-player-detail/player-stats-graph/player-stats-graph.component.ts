import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { PlayerStatsService } from '../../../Shared/services/player-stats.service';
import { PlayerService } from '../../../Shared/services/player.service';
import { TabsModule } from 'primeng/tabs';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ButtonModule } from 'primeng/button';
import { debounceTime, Subject } from 'rxjs';
import { CommonService } from '../../../Shared/services/common.service';

@Component({
  selector: 'app-player-stats-graph',
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
  templateUrl: './player-stats-graph.component.html',
  styleUrl: './player-stats-graph.component.scss',
})
export class PlayerStatsGraphComponent {
  @ViewChild('chart', { static: true }) chartContainer!: ElementRef;
  @Input() selectedPlayerDetail: any;
  @Input() selectedSport: string = 'mlb';
  thresholdValue: number = 0;
  statsList: any[] = [];
  selectedStats: any;
  value: any = 2;
  debounceSubject = new Subject<number>();
  activeColor: string = 'success';

  graphData: any[] = [];
  paymentOptions: any[] = [
    { name: 'L5', value: 1, avg: 0, hr: 0 },
    { name: 'L10', value: 2, avg: 0, hr: 0 },
    { name: 'L15', value: 3, avg: 0, hr: 0 },
    { name: 'L20', value: 4, avg: 0, hr: 0 },
  ];

  constructor(private PlayerStatsS: PlayerStatsService , public commonS:CommonService) {}

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
      this.statsList = this.PlayerStatsS.getStatsList();
      if (this.selectedSport === 'wnba') {
        this.statsList = this.statsList.filter((stat: any) => {
          return stat.id !== 'PF' && stat.id !== 'FTA' && stat.id !== 'FTM';
        });
      }

      const statsId =
        this.PlayerStatsS.getStatsIdByKey(this.selectedPlayerDetail?.field) ??
        'MIN';
      this.selectedStats = this.statsList.find((stat) => stat.id === statsId);
      const line = this.selectedPlayerDetail?.line ?? 0;

      this.thresholdValue = this.selectedPlayerDetail?.line ?? 0;
      this.getStatsList(statsId || 'MIN', 10, line);
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
      const lines = this.PlayerStatsS.getStatLineValuesByName(activeStats);
      this.thresholdValue = lines.length ? lines[0] : 0;
    }
    this.graphData = this.PlayerStatsS.preparePlayerStatsGraphData(
      activeStats,
      numberOfStats,
      this.selectedPlayerDetail?.opponent
    );

    const calStats = this.PlayerStatsS.calculatePlayerAvgAndHR(
      this.thresholdValue,
      activeStats,
      this.selectedPlayerDetail?.opponent
    );

    this.paymentOptions.map((option) => {
      option.avg = calStats[option.name]?.average;
      option.hr = calStats[option.name]?.percentageAboveBaseLine;
    });

    const hr = this.paymentOptions[this.value - 1]?.hr ?? 0;
    if (hr >= 50) {
      this.activeColor = 'success';
    } else {
      this.activeColor = 'danger';
    }

    if (
      activeStats === '3PM' ||
      activeStats === 'FGM' ||
      activeStats === 'FTM'
    ) {
      this.createChartPM(activeStats);
      return;
    }
    this.createChart();
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
               A ${barRadius},${barRadius} 0 0 1 ${x + xScale.bandwidth()},${
                height - 18 + barRadius
              } 
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
               A ${barRadius},${barRadius} 0 0 1 ${x + xScale.bandwidth()},${
                y + barRadius
              } 
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

  private createChartPM(activeStats: string): void {
    // Define the width, height, and margin inside the createChart function

    const containerWidth = this.chartContainer.nativeElement.clientWidth || 500;
    const width = containerWidth - 40;
    const height = 400;
    const margin = { top: 40, right: 20, bottom: 40, left: 20 };
    d3.select(this.chartContainer.nativeElement).selectAll('*').remove();
    const svg = d3
      .select(this.chartContainer.nativeElement)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(30, 120)`);
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

    // Transforming data to extract relevant fields

    const keys = this.PlayerStatsS.graphDataKeys(activeStats);
    const chartData = this.graphData.map((d) => ({
      game: d.category, // Use date as the game label
      opponent: d.data.opponent,
      player: d.data,
      PM: d.values[keys[0]], // Extract 3PM
      PA: d.values[keys[1]], // Extract 3PA
    }));

    const xScale = d3
      .scaleBand()
      .domain(chartData.map((d) => d.game))
      .range([0, width - margin.left - margin.right])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(chartData, (d) => d.PA)!])
      .range([height - margin.top - margin.bottom, 0]);
    const threshold = this.thresholdValue; // Threshold for PM

    // Dashed line for the threshold

    svg
      .selectAll('.bar-group')
      .data(chartData)
      .enter()
      .append('g')
      .attr('class', 'bar-group')
      .attr('transform', (d) => `translate(${xScale(d.game)}, 0)`)
      .each(function (d) {
        const group = d3
          .select(this)
          .on('mouseover', function (event) {
            const statsHtml = d.player?.value
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
              📅 ${d.player?.date || 'N/A'} &nbsp; @ ${
              d.player?.opponent || 'N/A'
            }
            </div>
            
            <hr style="border: 0.5px solid rgba(255, 255, 255, 0.1); margin: 8px 0;">
            ${statsHtml}
           
          </div>`;
            tooltip
              .html(tooltipHtml)
              .style('display', 'block')
              .style('left', `${event.pageX - 105}px`)
              .style('top', `${event.pageY - 10}px`);
          })
          .on('mousemove', function (event) {
            tooltip
              .style('left', `${event.pageX - 105}px`)
              .style('top', `${event.pageY - 10}px`);
          })
          .on('mouseleave', function () {
            tooltip.style('display', 'none');
          });

        // Background Bar (Total Attempts) - Rounded Top Only
        group
          .append('rect')
          .attr('x', 0)
          .attr('y', yScale(d.PA))
          .attr('width', xScale.bandwidth())
          .attr('height', yScale(0) - yScale(d.PA))
          .attr('fill', '#80808033')
          .attr('rx', 8)
          .attr('ry', 8);

        // Foreground Bar (Made Shots) - No Rounded Bottom, Only Top Rounded on PA Stack
        group
          .append('rect')
          .attr('x', 0)
          .attr('y', d.PM === 0 ? yScale(0.5) : yScale(d.PM))
          .attr('width', xScale.bandwidth())
          .attr(
            'height',
            d.PM === 0 ? yScale(0) - yScale(0.5) : yScale(0) - yScale(d.PM)
          )
          .attr('fill', d.PM < threshold ? 'red' : '#2ECC71') // Color based on PM and threshold
          .attr('rx', d.PM === 0 ? 2 : 5)
          .attr('ry', d.PM === 0 ? 2 : 0);

        // Labels Inside the Bars
        group
          .append('text')
          .attr('x', xScale.bandwidth() / 2)
          .attr('y', d.PA === 0 ? yScale(0.5) + 10 : yScale(d.PA) + 15)
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '10px')
          .style('font-weight', 'bold')
          .text(d.PA);

        group
          .append('text')
          .attr('x', xScale.bandwidth() / 2)
          .attr('y', d.PM === 0 ? yScale(0.5) + 10 : yScale(d.PM) + 15)
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '10px')
          .style('font-weight', 'bold')
          .text(d.PM);
      });

    // Axes
    svg
      .append('g')
      .attr('transform', `translate(0, ${height - margin.top - margin.bottom})`) // Place at the bottom of the chart
      .call(d3.axisBottom(xScale).tickFormat(() => '')) // Clear existing tick labels
      .selectAll('text')
      .attr('text-anchor', 'middle')
      .each(function (d: any) {
        const [date, team] = d.split('_'); // Split the value into date and team

        // Add the team name as a tspan
        d3.select(this)
          .append('tspan')
          .attr('x', 0)
          .attr('dy', '0.6em') // Offset for team name
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .text(team); // Display team name

        // Add the date as a second tspan below the team name
        d3.select(this)
          .append('tspan')
          .attr('x', 0)
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .attr('dy', '1.2em') // Offset for date below team name
          .text(date); // Display date
      });
    // Create a horizontal line at the threshold
    svg
      .append('line')
      .attr('x1', 0)
      .attr('x2', width - margin.left - margin.right)
      .attr('y1', yScale(threshold))
      .attr('y2', yScale(threshold))
      .attr('stroke', 'gray')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('display', threshold === 0 ? 'none' : 'block');
    // svg.append('g').call(d3.axisLeft(yScale));
  }
}
