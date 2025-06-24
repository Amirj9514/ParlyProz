import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Skeleton } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';
import { FormGroup } from '@angular/forms';
import { SharedService } from '../../../Shared/services/shared.service';
import { CommonService } from '../../../Shared/services/common.service';

@Component({
  selector: 'app-projection-table',
  standalone: true,
  imports: [
    TableModule,
    TagModule,
    Skeleton,
    TooltipModule,
    CommonModule,
    PaginatorModule,
  ],
  templateUrl: './projection-table.component.html',
  styleUrl: './projection-table.component.scss',
})
export class ProjectionTableComponent implements OnChanges {
  @Input() projectionData: any[] = [];
  @Input() projectionLoader: boolean = false;
  @Input() totalRecords: number = 0;
  @Input() filterForm!: FormGroup;
  @Input() activeGameApiendpoint: string = 'mlb';
  @Output() onPlayerClick = new EventEmitter<number>();
  @Output() onPagination = new EventEmitter<{ pageNo: number; rows: number }>();
  @ViewChild('projectionTable') projectionTable!: Table;
  first: number = 0;
  rows: number = 50;
  page: number = 1;
  pageCount: number = 0;
  sortCol: { field: string | null; order: number } = { field: null, order: -1 };

  tableColumns: any[] = [
    {
      header: 'Player',
      toolTip: '',
      toolTipPosition: 'bottom',
    },
    {
      header: 'Apps',
      toolTip: '',
      toolTipPosition: 'bottom',
    },
    {
      header: 'Line',
      toolTip: '',
      toolTipPosition: 'bottom',
    },
    {
      header: 'Avg L10',
      toolTip: 'Average over last 10 games',
      toolTipPosition: 'bottom',
    },
    {
      header: 'Diff',
      toolTip: ' Difference of projection and average over last 10 games',
      toolTipPosition: 'bottom',
      sortFeild: 'average_last_10_line_diff',
    },
    {
      header: 'L5',
      toolTip: 'Percentage of last 5 games going over projection',
      toolTipPosition: 'bottom',
      sortFeild: 'last_5_over_line_percentage',
    },
    {
      header: 'L10',
      toolTip: 'Percentage of last 10 games going over projection',
      toolTipPosition: 'bottom',
      sortFeild: 'last_10_over_line_percentage',
    },
    {
      header: 'L15',
      toolTip: 'Percentage of last 15 games going over projection',
      toolTipPosition: 'bottom',
      sortFeild: 'last_15_over_line_percentage',
    },
    {
      header: 'Strk',
      toolTip: 'Current game streak over projection',
      toolTipPosition: 'bottom',
      sortFeild: 'streak',
    },
  ];

  constructor(private sharedS: SharedService , public commonS:CommonService) {

  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectionLoader']) {
      if (this.projectionLoader && !this.projectionData.length) {
        this.projectionData = Array.from({ length: 80 }).map(
          (_, i) => `Item #${i}`
        );
      } else {
        this.projectionData = this.projectionData;
      }
    }

    setTimeout(() => {
      this.projectionTable.reset();
      this.projectionTable.sortField = 'average_last_10_line_diff';
      this.projectionTable.sortOrder = -1;

      this.first = 0;
    }, 0);
  }

  returnSeverity(value: any, type: string, line?: any) {
    let min: number = 0;
    let max: number = 0;

    if (type === 'avgLast10') {
      min = line;
      max = line;
    } else if (type === 'diff') {
      min = 0;
      max = 100000;
    } else if (type === 'streak') {
      min = 2;
      max = 3;
    } else {
      min = 49;
      max = 55;
    }

    if (value <= min) {
      return 'danger-td';
    } else if (max === 100000) {
      return 'success-td';
    } else if (value > max) {
      return 'success-td';
    } else {
      return 'warning-td';
    }
  }
  roundValue(value: any) {
    try {
      if (Number.isInteger(value)) {
        return value;
      }
      return parseFloat(value.toFixed(1));
    } catch (error) {
      return '--';
    }
  }

  customSort(event: any) {
    if (
      this.sortCol.field === event.field &&
      this.sortCol.order === event.order
    ) {
      return; // Prevent redundant API calls
    }
    this.sortCol = { field: event.field, order: event.order };
    this.first = 0;
    this.page = 1;
    const formValue = this.filterForm.value;

    const selectedMatch = formValue.match;
    let fixture_slugs: { team_a: any[]; team_b: any[] } = {
      team_a: [],
      team_b: [],
    };
    if (Array.isArray(selectedMatch) && selectedMatch.length) {
      selectedMatch.forEach(match => {
        const { team_a, team_b } = this.commonS.getTeams(match) || {};
        if (team_a) fixture_slugs.team_a.push(team_a);
        if (team_b) fixture_slugs.team_b.push(team_b);
      });
    }

    const fixture_slug = {
      team_a: fixture_slugs.team_a.join(','),
      team_b: fixture_slugs.team_b.join(','),
    }
    const stats = formValue.stats.map((stat: any) => stat.code).join(',');
    const search = formValue.search;
    // const fixture_slug =this.commonS.getTeams(formValue.match);
    const apps = this.commonS.getSelectedApp(formValue.apps);
    this.getProjections(stats, search , fixture_slug ,apps);
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.page = event.page + 1;
    this.pageCount = event.pageCount;
    this.applyFilter(this.filterForm.value);
  }

  applyFilter(formValue: any) {

    const selectedMatch = formValue.match;
    let fixture_slugs: { team_a: any[]; team_b: any[] } = {
      team_a: [],
      team_b: [],
    };
    if (Array.isArray(selectedMatch) && selectedMatch.length) {
      selectedMatch.forEach(match => {
        const { team_a, team_b } = this.commonS.getTeams(match) || {};
        if (team_a) fixture_slugs.team_a.push(team_a);
        if (team_b) fixture_slugs.team_b.push(team_b);
      });
    }

    const fixture_slug = {
      team_a: fixture_slugs.team_a.join(','),
      team_b: fixture_slugs.team_b.join(','),
    }
    const stats = formValue.stats.map((stat: any) => stat.code).join(',');
    const search = formValue.search;
    // const fixture_slug =this.commonS.getTeams(formValue.match);
    const apps = this.commonS.getSelectedApp(formValue.apps);
    this.getProjections(stats, search , fixture_slug , apps);
  }

  getProjections(stats: string, search: string , fixture_slug: any , apps: string) {
    this.projectionLoader = true;
    const order_field = this.sortCol?.field ?? 'average_last_10_line_diff';
    this.sharedS
      .sendGetRequest(
        `${this.activeGameApiendpoint}/dashboard/stats?name=${
          search ?? ''
        }&stat_fields=${stats ?? ''}&limit=${this.rows}&offset=${
          this.page
        }&order_field=${order_field}&order=${this.sortCol.order}&team_a=${
          fixture_slug.team_a ?? ''
        }&team_b=${
          fixture_slug.team_b ?? ''
        }&bookie=${apps ?? ''}`
      )
      .subscribe({
        next: (res: any) => {
          this.projectionLoader = false;
          if (res.status == 200) {
            this.totalRecords = res.body?.page_info?.total_records ?? 120;
            this.projectionData = res.body.stats ?? [];
          }
        },
        error: (err: any) => {
          this.projectionLoader = false;
        },
      });
  }

  redirectToPlayerDetail(player: any) {
    this.onPlayerClick.emit(player);
  }

  capatlizeStats(value: string) {
    if (!value) return '';
    return value.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }

  getInitials(fullName: string): string {
    if (!fullName) return 'N/A';
    return fullName
      .split(' ')
      .map((name) => name[0])
      .join('')
      .toUpperCase();
  }
}
