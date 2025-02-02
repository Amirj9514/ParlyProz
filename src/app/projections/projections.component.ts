import { Component, OnInit } from '@angular/core';
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
import { ComingSoonComponent } from "./coming-soon/coming-soon.component";
import { SinglePlayerDetailComponent } from "../single-player-detail/single-player-detail.component";
import { registerables, Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-projections',
  standalone:true,
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
    SinglePlayerDetailComponent
],
  templateUrl: './projections.component.html',
  styleUrl: './projections.component.scss',
})
export class ProjectionsComponent implements OnInit {
  filterForm!: FormGroup;
  statsList: any[] = [];
  statsLoader: boolean = false;
  projectionData: any[] = [];
  projectionLoader: boolean = false;
  stopFormTrigger: boolean = true;
  activeGameApiendpoint: string = 'nba';
  comingSoon: boolean = false;
  selectedPlayer:number = NaN;
  showPlayerDetail:boolean = false;

  constructor(private sharedS: SharedService) {
    this.filterForm = new FormGroup({
      search: new FormControl(''),
      stats: new FormControl(''),
    });
  }

  ngOnInit(): void {
    this.getStatsAndProjections();
    this.observeFormChanges();
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
              `${this.activeGameApiendpoint}/players/stats?name=${''}&stat_fields=${stats}`
            );
          }
          return of([]);
        })
      )
      .subscribe({
        next: (res: any) => {
          this.statsLoader = false;
          this.stopFormTrigger = false;
          if (res.status === 200) {
            this.projectionData = res.body ?? [];
          }
        },
        error: (err: any) => {
          this.statsLoader = false;
          this.stopFormTrigger = false;
          console.error('Error:', err);
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
    this.getProjections(stats, search);
  }

  getProjections(stats: string, search: string) {
    this.sharedS
      .sendGetRequest(`${this.activeGameApiendpoint}/players/stats?name=${search}&stat_fields=${stats}`)
      .subscribe({
        next: (res: any) => {
          this.projectionLoader = false;
          if (res.status == 200) {
            this.projectionData = res.body ?? [];
          }
        },
        error: (err: any) => {
          this.projectionLoader = false;
        },
      });
  }

  openPlayerDetail(playerId: number) {
    this.selectedPlayer = playerId;
    this.showPlayerDetail = true;
  }

  onGameChange(endpoint: string | null) {
    if(!endpoint){
      this.comingSoon = true;
      this.filterForm.reset();
      return;
    }
    this.comingSoon = false;
    this.activeGameApiendpoint = endpoint;
    this.getStatsAndProjections();
  }
}
