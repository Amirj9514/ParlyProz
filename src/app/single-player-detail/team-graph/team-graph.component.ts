import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import * as d3 from 'd3';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ChartModule } from 'primeng/chart';
import { TabsModule } from 'primeng/tabs';
import { InputNumberModule } from 'primeng/inputnumber';
import { PlayerService } from '../../../Shared/services/player.service';
import { TeamService } from '../../../Shared/services/team.service';
import { PlayerStatsService } from '../../../Shared/services/player-stats.service';
import { debounceTime, Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-team-graph',
  standalone: true,
  imports: [
    SelectButtonModule,
    FormsModule,
    ChartModule,
    TabsModule,
    InputNumberModule,
    CommonModule,
    InputGroupModule,
    InputGroupAddonModule,
    ButtonModule,
  ],
  templateUrl: './team-graph.component.html',
  styleUrl: './team-graph.component.scss',
})
export class TeamGraphComponent implements OnInit {
  @ViewChild('TeamChart', { static: true }) chartContainer!: ElementRef;
  thresholdValue: number = 0;
  statsList: any[] = [];
  selectedStats: any;
  value: number = 2;
  debounceSubject = new Subject<number>();

  graphData: any[] = [];
  paymentOptions: any[] = [
    { name: 'L5', value: 1, avg: 0, hr: 0 },
    { name: 'L10', value: 2, avg: 0, hr: 0 },
    { name: 'L15', value: 3, avg: 0, hr: 0 },
    { name: 'L20', value: 4, avg: 0, hr: 0 },
  ];

  constructor(
    private PlayerStatsS: TeamService,
    private playerS: PlayerService
  ) {}

  ngOnInit() {
    this.statsList = this.PlayerStatsS.getStatsList();
    this.selectedStats = this.statsList[0];
    this.getStatsList('MIN', 10);
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
    } 
    this.graphData = this.PlayerStatsS.preparePlayerStatsGraphData(
      activeStats,
      numberOfStats,
      this.thresholdValue
    );

    const calStats = this.PlayerStatsS.calculatePlayerAvgAndHR(
      this.thresholdValue,
      activeStats
    );

    this.paymentOptions.map((option) => {
      option.avg = calStats[option.name].average;
      option.hr = calStats[option.name].percentageAboveBaseLine;
    });
    this.createChart();
  }

  onStatsChange(tab: any) {
    this.selectedStats = tab;
    this.getStatsList(tab.id, this.value * 5);
  }

  onPlayerMatchChange(event: any) {
    const numberOfStats = event * 5;
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
    const width = containerWidth - 40;
    const height = 320;
    const margin = { top: 40, right: 20, bottom: 40, left: 20 };
    const barRadius = 8;
    const lineValue = this.thresholdValue;

    d3.select(this.chartContainer.nativeElement).selectAll('*').remove();

    const svg = d3
      .select(this.chartContainer.nativeElement)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

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
            .attr('y', height - 9)
            .attr('text-anchor', 'middle')
            .attr('fill', 'black')
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
          barHeight = Math.max(barHeight, 20); // Ensure minimum visibility

          const y = yOffset - barHeight;
          yOffset = y;

          const isLastStack = index === allKeys.length - 1; // Check if this is the topmost stack
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
            .attr('fill', barColor as string);

          d3.select(this)
            .append('text')
            .text(`${value} ${key}`)
            .attr('x', x + xScale.bandwidth() / 2)
            .attr('y', y + barHeight / 2 + 5)
            .attr('text-anchor', 'middle')
            .attr('fill', 'white')
            .attr('font-size', '10px')
            .attr('font-weight', 'bold');
        });

        d3.select(this)
          .append('text')
          .text(totalValue)
          .attr('x', x + xScale.bandwidth() / 2)
          .attr('y', yOffset - 10)
          .attr('text-anchor', 'middle')
          .attr('fill', 'black')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .style('display', allKeys.length > 1 ? 'block' : 'none');
      });

    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(() => ''))
      .selectAll('text')
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

    //  svg.append('g').call(d3.axisLeft(yScale));

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
}
