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
import { debounceTime, distinctUntilChanged, of, switchMap, take } from 'rxjs';
import { ComingSoonComponent } from './coming-soon/coming-soon.component';
import { SinglePlayerDetailComponent } from '../single-player-detail/single-player-detail.component';
import { registerables, Chart } from 'chart.js';
import { SelectModule } from 'primeng/select';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { CommonModule } from '@angular/common';
import { PlayerCardComponent } from './player-card/player-card.component';
import { SkeletonModule } from 'primeng/skeleton';
import { DatePipe } from '@angular/common';
import { TeamService } from '../../Shared/services/team.service';
import { CommonService } from '../../Shared/services/common.service';
import { NhlSinglePlayerDetailComponent } from '../nhl-single-player-detail/nhl-single-player-detail.component';
import { MlbSinglePlayerDetailComponent } from '../mlb-single-player-detail/mlb-single-player-detail.component';
import { NflSignlePlayerDetailComponent } from "../nfl-signle-player-detail/nfl-signle-player-detail.component";

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
    SkeletonModule,
    NhlSinglePlayerDetailComponent,
    MlbSinglePlayerDetailComponent,
    NflSignlePlayerDetailComponent
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
  activeGameApiendpoint: string = 'mlb';
  comingSoon: boolean = false;
  selectedPlayer: number = NaN;
  showPlayerDetail: boolean = false;
  totalRecords: number = 0;
  gameList: any[] = [];
  gameListLoader: boolean = false;
  selectedCountry: string | undefined;
  apps: any[] = [];
  page = 1;
  limit = 50;
  totalPages = 0;
  selectedPlayerDetail: any;

  constructor(
    private sharedS: SharedService,
    private teamS: TeamService,
    private commonS: CommonService
  ) {
    this.apps = this.commonS.getApps();
    this.filterForm = new FormGroup({
      search: new FormControl(''),
      stats: new FormControl(''),
      match: new FormControl(null),
      apps: new FormControl(this.apps),
    });
  }

  ngOnInit(): void {
    this.getActiveGame();
    this.getStatsAndProjections();
    this.observeFormChanges();
  }

  getActiveGame() {
    this.sharedS
      .getData()
      .pipe(take(1))
      .subscribe((data: any) => {
        this.activeGameApiendpoint = data?.game?.api ?? 'mlb';
      });
  }

  getStatsAndProjections() {
    this.statsLoader = true;
    this.sharedS
      .sendGetRequest(`${this.activeGameApiendpoint}/stat/fields`)
      .pipe(
        switchMap((res: any) => {
          if (res.status === 200) {
            this.statsList = res.body ?? [];
            this.getGameList();
            this.filterForm.get('stats')?.setValue(this.statsList);
            const stats = this.statsList
              .map((stat: any) => stat.code)
              .join(',');
            const selectedApp = this.commonS.getSelectedApp(
              this.filterForm.get('apps')?.value
            );
            return this.sharedS.sendGetRequest(
              `${
                this.activeGameApiendpoint
              }/dashboard/stats?name=${''}&stat_fields=${stats}&bookie=${selectedApp}`
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

    const selectedMatch = formValue.match;
    let fixture_slugs: { team_a: any[]; team_b: any[] } = {
      team_a: [],
      team_b: [],
    };
    if (Array.isArray(selectedMatch) && selectedMatch.length) {
      selectedMatch.forEach((match) => {
        const { team_a, team_b } = this.commonS.getTeams(match) || {};
        if (team_a) fixture_slugs.team_a.push(team_a);
        if (team_b) fixture_slugs.team_b.push(team_b);
      });
    }

    const fixture_slug = {
      team_a: fixture_slugs.team_a.join(','),
      team_b: fixture_slugs.team_b.join(','),
    };

    const stats = formValue.stats.map((stat: any) => stat.code).join(',');
    const search = formValue.search;
    // const fixture_slug =this.commonS.getTeams(formValue.match);
    const selectedApp = this.commonS.getSelectedApp(formValue.apps);
    this.getProjections(stats, search, fixture_slug, selectedApp);
  }

  getProjections(
    stats: string,
    search: string,
    fixture_slug: any,
    apps: string,
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
        }&stat_fields=${stats ?? ''}&team_a=${
          fixture_slug.team_a ?? ''
        }&team_b=${fixture_slug.team_b ?? ''}&limit=${50}&offset=${
          this.page
        }&bookie=${apps ?? ''}`
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
          this.gameList = [];
          this.gameListLoader = false;
          if (res.status === 200) {
            const data = res.body ?? [];
            if (data.length) {
              for (const element of data) {
                const datePipe = new DatePipe('en-US');
                const formattedDate = datePipe.transform(
                  element.start_time,
                  'MM-dd-yyyy hh:mm a'
                );
                const optionData = `${element?.first_competitor_abbreviation} V/S ${element?.second_competitor_abbreviation} @ ${formattedDate}`;
                this.gameList.push({
                  ...element,
                  optionData: optionData,
                });
              }
            } else {
              this.gameList = [];
            }
            this.convertDate();
          }
        },
        error: (err: any) => {
          this.gameListLoader = false;
          console.log(err);
        },
      });
  }

  openPlayerDetail(playerId: any) {
    this.selectedPlayerDetail = playerId;
    this.selectedPlayer = playerId.player_id;
    this.showPlayerDetail = true;
  }

  onGameChange(endpoint: string | null) {
    if (!endpoint) {
      this.comingSoon = true;
      this.filterForm.reset();
      return;
    }

    this.filterForm.controls['match'].setValue(null);
    this.filterForm.controls['search'].setValue('');
    this.filterForm.controls['stats'].setValue(null);
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

      const selectedMatch = formValue.match;
      let fixture_slugs: { team_a: any[]; team_b: any[] } = {
        team_a: [],
        team_b: [],
      };
      if (Array.isArray(selectedMatch) && selectedMatch.length) {
        selectedMatch.forEach((match) => {
          const { team_a, team_b } = this.commonS.getTeams(match) || {};
          if (team_a) fixture_slugs.team_a.push(team_a);
          if (team_b) fixture_slugs.team_b.push(team_b);
        });
      }

      const fixture_slug = {
        team_a: fixture_slugs.team_a.join(','),
        team_b: fixture_slugs.team_b.join(','),
      };
      const stats = formValue.stats.map((stat: any) => stat.code).join(',');
      const search = formValue.search;
      // const fixture_slug =this.commonS.getTeams(formValue.match);
      const apps = this.commonS.getSelectedApp(formValue.apps);

      this.getProjections(stats, search, fixture_slug, apps, true);
    }
  }

  convertDate() {
    let date: any = '';
    if (this.gameList && this.gameList.length > 0) {
      let latestDate: Date | null = null;

      this.gameList.forEach((game: any) => {
        const updateDate = new Date(game?.created_at);
        if (!latestDate || updateDate > latestDate) {
          latestDate = updateDate;
        }
      });
      let updateDate: Date | null = null;
      if (latestDate) {
        updateDate = new Date(latestDate);
      }

      if (updateDate) {
        const datePipe = new DatePipe('en-US');
        const utcDate = new Date(updateDate); // Convert to Date object
        date = datePipe.transform(utcDate, 'hh:mm a', '-0400');
      }
    }

    this.teamS.setUpdateDate(date || '');
  }
}
