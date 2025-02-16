import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { PlayerService } from '../../../Shared/services/player.service';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [TableModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent implements OnInit {
  players: any[] = [];
  constructor(private playerS:PlayerService){}

  ngOnInit(): void {
    this.getPlayerList();
  }


  getPlayerList() {
    this.players =  this.playerS.getPlayers(15);
  }

  roundValue(value: number) {
    return (value).toFixed(1);
  }
 

  
  // private createChart() {
  //   const data = [
  //     { category: '02-10', values: [30, 20] },
  //     { category: '02-11', values: [40, 30] },
  //     { category: '02-12', values: [50] },
  //     { category: '02-13', values: [60, 25 , 30] },
  //     { category: '02-143', values: [0] },
  //     { category: '02-14', values: [1] },
  //     { category: '02-15', values: [80, 20] },
  //     { category: '02-120', values: [30, 20] },
  //     { category: '02-211', values: [40, 30] },
  //     { category: '02-122', values: [50] },
  //     { category: '02-123', values: [60, 25 , 30] },
  //     { category: '02-1243', values: [0] },
  //     { category: '02-1r4', values: [1] },
  //     { category: '02-1r5', values: [80, 20] },
  //     { category: '02-1ds0', values: [30, 20] },
  //     { category: '02-1c1', values: [40, 30] },
  //     { category: '02-1xc2', values: [50] },
  //     { category: '02-1x3', values: [60, 25 , 30] },
  //     { category: '02-1v43', values: [0] },
  //     { category: '02-1vc4', values: [1] },
  //   ];

  //   const thresholdValue = 50; // 🔥 Set threshold

      
  // const containerWidth = this.chartContainer.nativeElement.clientWidth || 500;
  // const width = containerWidth - 80; // Ensure some padding
  // const height = 450;
  //   const
  //     margin = { top: 40, right: 20, bottom: 60, left: 40 },
  //     barRadius = 8,
  //     minBarHeight = 20,
  //     zeroBarHeight = 10;

  //   const svg = d3
  //     .select(this.chartContainer.nativeElement)
  //     .append('svg')
  //     .attr('width', width + margin.left + margin.right)
  //     .attr('height', height + margin.top + margin.bottom)
  //     .append('g')
  //     .attr('transform', `translate(${margin.left},${margin.top})`);

  //   const xScale = d3
  //     .scaleBand()
  //     .domain(data.map((d) => d.category))
  //     .range([0, width])
  //     .padding(0.2);

  //   const maxYValue = d3.max(data, (d) => d3.sum(d.values)) || 0;
  //   const yScale = d3.scaleLinear().domain([0, maxYValue + 10]).range([height, 0]);

  //   const subgroups = ['stack1', 'stack2', 'stack3'];
  //   const colorAbove = d3.scaleOrdinal().domain(subgroups).range(['#2ecc71', '#27ae60', '#1e8449']); 
  //   const colorBelow = d3.scaleOrdinal().domain(subgroups).range(['#e74c3c', '#c0392b', '#922b21']);

  

  //   const barsGroup = svg.append("g").attr("class", "bars-group");

  //   barsGroup
  //     .selectAll('.bar-group')
  //     .data(data)
  //     .enter()
  //     .append('g')
  //     .each(function (d, dataIndex) {
  //       let yOffset = height;
  //       let lastNonZeroY = height;
  //       const x = xScale(d.category)!;
  //       const total = d3.sum(d.values);
  //       const stackCount = d.values.filter(v => v > 0).length;

  //       const isAboveThreshold = total > thresholdValue;
  //       const isEqualThreshold = total === thresholdValue;
  //       const baseColorScale = isAboveThreshold ? colorAbove : colorBelow;

  //       if (total === 0) {
  //         d3.select(this)
  //           .append('rect')
  //           .attr('x', x)
  //           .attr('y', height - zeroBarHeight)
  //           .attr('width', xScale.bandwidth())
  //           .attr('height', zeroBarHeight)
  //           .attr('fill', baseColorScale('stack1') as string);

  //         d3.select(this)
  //           .append('text')
  //           .text('0')
  //           .attr('x', x + xScale.bandwidth() / 2)
  //           .attr('y', height - zeroBarHeight / 2 + 5)
  //           .attr('text-anchor', 'middle')
  //           .attr('fill', 'white')
  //           .attr('font-size', '14px')
  //           .attr('font-weight', 'bold');
  //         return;
  //       }

  //       d.values.forEach((value, index) => {
  //         let barHeight = value === 0 ? zeroBarHeight : height - yScale(value);
  //         if (barHeight < minBarHeight && value > 0) barHeight = minBarHeight;

  //         const y = yOffset - barHeight;
  //         yOffset = y;
  //         lastNonZeroY = y;

  //         const isTopStack = index === d.values.length - 1;
  //         const isSingleStack = stackCount === 1;
  //         const opacity = 1 - (index * 0.2); // 🔥 Reduce opacity per stack

  //         d3.select(this)
  //           .append('path')
  //           .attr('d', () => {
  //             if (isTopStack || isSingleStack) {
  //               return `
  //                 M ${x},${y + barRadius} 
  //                 A ${barRadius},${barRadius} 0 0 1 ${x + barRadius},${y}
  //                 H ${x + xScale.bandwidth() - barRadius} 
  //                 A ${barRadius},${barRadius} 0 0 1 ${x + xScale.bandwidth()},${y + barRadius}
  //                 V ${y + barHeight} 
  //                 H ${x} 
  //                 Z
  //               `;
  //             } else {
  //               return `
  //                 M ${x},${y} 
  //                 H ${x + xScale.bandwidth()} 
  //                 V ${y + barHeight} 
  //                 H ${x} 
  //                 Z
  //               `;
  //             }
  //           })
  //           .attr('fill', baseColorScale(subgroups[index % subgroups.length]) as string)
  //           .attr('opacity', opacity);

  //         d3.select(this)
  //           .append('text')
  //           .text(value)
  //           .attr('x', x + xScale.bandwidth() / 2)
  //           .attr('y', y + barHeight / 2)
  //           .attr('text-anchor', 'middle')
  //           .attr('fill', 'white')
  //           .attr('font-size', '12px')
  //           .attr('font-weight', 'bold');
  //       });

  //       d3.select(this)
  //         .append('text')
  //         .text(total)
  //         .attr('x', x + xScale.bandwidth() / 2)
  //         .attr('y', Math.max(lastNonZeroY - 10, 15))
  //         .attr('text-anchor', 'middle')
  //         .attr('fill', 'black')
  //         .attr('font-size', '14px')
  //         .attr('font-weight', 'bold');
  //     });

  //   const xAxis = d3.axisBottom(xScale);
  //   svg
  //     .append('g')
  //     .attr('transform', `translate(0,${height})`)
  //     .call(xAxis)
  //     .selectAll('text')
  //     .style('text-anchor', 'middle')
  //     .style('font-size', '12px')
  //     .attr('dy', '1em');

  //   // const yAxis = d3.axisLeft(yScale);
  //   // svg.append('g').call(yAxis);

  //   // svg
  //   //   .append('text')
  //   //   .attr('x', width / 2)
  //   //   .attr('y', height + 40)
  //   //   .attr('text-anchor', 'middle')
  //   //   .style('font-size', '14px')
  //   //   .text('Date');

  //   // svg
  //   //   .append('text')
  //   //   .attr('transform', 'rotate(-90)')
  //   //   .attr('x', -height / 2)
  //   //   .attr('y', -30)
  //   //   .attr('text-anchor', 'middle')
  //   //   .style('font-size', '14px')
  //   //   .text('Values');


  //       // 🔥 Ensure line is drawn on top (z-index fix)
  //   const thresholdGroup = svg.append("g").attr("class", "threshold-line-group");
  //   thresholdGroup
  //     .append('line')
  //     .attr('x1', 0)
  //     .attr('x2', width)
  //     .attr('y1', yScale(thresholdValue))
  //     .attr('y2', yScale(thresholdValue))
  //     .attr('stroke', 'black')
  //     .attr('stroke-width', 2)
  //     .attr('stroke-dasharray', '5,5');
  // }
}
