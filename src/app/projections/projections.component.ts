import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { ProjectionTableComponent } from './projection-table/projection-table.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { FloatLabelModule } from 'primeng/floatlabel';
import { SharedService } from '../../Shared/services/shared.service';
import { debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { ComingSoonComponent } from './coming-soon/coming-soon.component';
import { SinglePlayerDetailComponent } from '../single-player-detail/single-player-detail.component';
import { registerables, Chart } from 'chart.js';
import { SelectModule } from 'primeng/select';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { CommonModule } from '@angular/common';
import { PlayerCardComponent } from './player-card/player-card.component';
import { SkeletonModule } from 'primeng/skeleton';

Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-projections',
  standalone: true,
  imports: [
    HeaderComponent,
    ProjectionTableComponent,
    ReactiveFormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    MultiSelectModule,
    FloatLabelModule,
    ComingSoonComponent,
    SinglePlayerDetailComponent,
    SelectModule,
    CommonModule,
    PlayerCardComponent,
    SkeletonModule
  ],
  templateUrl: './projections.component.html',
  styleUrl: './projections.component.scss',
})
export class ProjectionsComponent implements OnInit {
  @ViewChild('scrollObserver', { static: false }) scrollObserver!: ElementRef;
  filterForm!: FormGroup;
  statsList: any[] = [];
  statsLoader: boolean = false;
  projectionData: any[] = [];
  projectionLoader: boolean = false;
  stopFormTrigger: boolean = true;
  activeGameApiendpoint: string = 'nba';
  comingSoon: boolean = false;
  selectedPlayer: number = NaN;
  showPlayerDetail: boolean = false;
  totalRecords: number = 0;
  gameList: any[] = [];
  gameListLoader: boolean = false;
  selectedCountry: string | undefined;
  page = 1;
  limit = 50;
  totalPages = 0;

  constructor(private sharedS: SharedService) {
    this.filterForm = new FormGroup({
      search: new FormControl(''),
      stats: new FormControl(''),
      match: new FormControl(null),
    });
  }

  ngOnInit(): void {
    this.getStatsAndProjections();
    this.observeFormChanges();
    this.getGameList();
  }

  getStatsAndProjections() {
    this.statsLoader = true;
    this.sharedS
      .sendGetRequest(`${this.activeGameApiendpoint}/stat/fields`)
      .pipe(
        switchMap((res: any) => {
          if (res.status === 200) {
            this.statsList = res.body ?? [];
            this.filterForm.get('stats')?.setValue(this.statsList);
            const stats = this.statsList
              .map((stat: any) => stat.code)
              .join(',');
            return this.sharedS.sendGetRequest(
              `${
                this.activeGameApiendpoint
              }/dashboard/stats?name=${''}&stat_fields=${stats}`
            );
          }
          return of([]);
        })
      )
      .subscribe({
        next: (res: any) => {
          this.statsLoader = false;

          if (res.status === 200) {
            this.totalRecords = res.body?.page_info?.total_records ?? 120;
            this.projectionData = res.body.stats ?? [];
            this.page++;
            this.totalPages = res.body?.page_info?.total_pages ?? 0;
          }

          setTimeout(() => {
            this.stopFormTrigger = false;
          }, 0);
        },
        error: (err: any) => {
          this.statsLoader = false;
          setTimeout(() => {
            this.stopFormTrigger = false;
          }, 0);
          this.projectionData = [];
        },
      });
  }

  observeFormChanges() {
    this.filterForm.valueChanges
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((filterValues) => {
        this.applyFilter(filterValues);
      });
  }

  applyFilter(formValue: any) {
    if (this.stopFormTrigger) return;
    const stats = formValue.stats.map((stat: any) => stat.code).join(',');
    const search = formValue.search;
    const fixture_slug = formValue.match?.fixture_slug ?? '';

    this.getProjections(stats, search, fixture_slug);
  }

  getProjections(
    stats: string,
    search: string,
    fixture_slug: string,
    loader: boolean = false
  ) {
    if (!this.projectionData.length) {
      this.projectionLoader = true;
    }

    if (loader) {
      if (this.page > this.totalPages) return;
      this.page++;
      this.projectionLoader = true;
    } else {
      this.projectionLoader = true;
      this.page = 1;
    }

    this.sharedS
      .sendGetRequest(
        `${this.activeGameApiendpoint}/dashboard/stats?name=${
          search ?? ''
        }&stat_fields=${stats ?? ''}&fixture_slug=${fixture_slug ?? ''}&limit=${50}&offset=${
          this.page
        }`
      )
      .subscribe({
        next: (res: any) => {
          this.projectionLoader = false;
          if (res.status == 200) {
            this.totalRecords = res.body?.page_info?.total_records ?? 120;
            const data = res.body.stats ?? [];

            if (loader) {
              
              this.projectionData = [...this.projectionData, ...data];
              this.totalPages = res.body?.page_info?.total_pages ?? 0;
            } else {
              this.projectionData = res.body.stats ?? [];
              this.totalPages = res.body?.page_info?.total_pages ?? 0;
            }
          }
        },
        error: (err: any) => {
          this.projectionLoader = false;
        },
      });
  }

  getGameList() {
    this.gameListLoader = true;
    this.sharedS
      .sendGetRequest(`${this.activeGameApiendpoint}/matches`)
      .subscribe({
        next: (res: any) => {
          this.gameListLoader = false;
          if (res.status === 200) {
            this.gameList = res.body ?? [];
          }
        },
        error: (err: any) => {
          this.gameListLoader = false;
          console.log(err);
        },
      });
  }

  openPlayerDetail(playerId: number) {
    this.selectedPlayer = playerId;
    this.showPlayerDetail = true;
  }

  onGameChange(endpoint: string | null) {
    if (!endpoint) {
      this.comingSoon = true;
      this.filterForm.reset();
      return;
    }
    this.comingSoon = false;
    this.activeGameApiendpoint = endpoint;
    this.getStatsAndProjections();
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    this.checkIfInView();
  }

  checkIfInView() {
    if (!this.scrollObserver) return;

    const rect = this.scrollObserver.nativeElement.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    if (
      rect.top <= windowHeight &&
      rect.bottom >= 0 &&
      !this.projectionLoader
    ) {
      // this.getPlayersList(true);
      const formValue = this.filterForm.value;
      const stats = formValue.stats.map((stat: any) => stat.code).join(',');
      const search = formValue.search;
      const fixture_slug = formValue.match?.fixture_slug ?? '';

      this.getProjections(stats, search, fixture_slug, true);
    }
  }
}
