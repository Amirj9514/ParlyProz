import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TableModule } from 'primeng/table';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { MultiSelectModule } from 'primeng/multiselect';
import { FloatLabel } from 'primeng/floatlabel';
import { DatePickerModule } from 'primeng/datepicker';
import { Skeleton } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ChipModule } from 'primeng/chip';
import { Router } from '@angular/router';
import { SharedService } from '../Shared/services/shared.service';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { TagModule } from 'primeng/tag';
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    HeaderComponent,
    TooltipModule,
    ChipModule,
    SidebarComponent,
    DatePickerModule,
    TableModule,
    IconField,
    InputIcon,
    MultiSelectModule,
    FloatLabel,
    TagModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    Skeleton
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent implements OnInit {
  value: any;
  date: any;

  filterForm!: FormGroup;
  projectionData: any[] = [];
  projectionLoader: boolean = false;
  statsList: any[] = [];
  statsLoader: boolean = false;
  constructor(private router: Router, private sharedS: SharedService) {
    this.filterForm = new FormGroup({
      stats: new FormControl(''),
      search: new FormControl(''),
    });
  }

  ngOnInit(): void {
    this.getStatList();
    this.observeFormChanges();
  }

  observeFormChanges() {
    this.filterForm.valueChanges
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((filterValues) => {
        this.applyFilter(filterValues);
      });
  }

  applyFilter(formValue: any) {
    const stats = formValue.stats.map((stat: any) => stat.code).join(',');
    const search = formValue.search;
    this.getProjections(stats, search , !this.projectionData.length);
  }

  getProjections(stats: string, search: string, showLoader: boolean) {
    if (showLoader) {
      this.projectionLoader = true;
      this.projectionData = Array.from({ length: 14 }).map((_, i) => `Item #${i}`);
    }
    this.sharedS
      .sendGetRequest(`nba/players/stats?name=${search}&stat_fields=${stats}`)
      .subscribe({
        next: (res: any) => {
          if(showLoader){
            this.projectionData = [];
          }
          this.projectionLoader = false;
          if (res.status == 200) {
            this.projectionData = res.body ?? [];
          }
        },
        error: (err: any) => {
          if(showLoader){
            this.projectionData = [];
          }
          this.projectionLoader = false;
        },
      });
  }

  returnClass(value: any, type: string) {
    let min: number = 0;
    let max: number = 0;

    if (type === 'avgLast10') {
      min = 0;
      max = 100000;
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
      return 'dangerTd';
    } else if (max === 100000) {
      return 'successTd';
    } else if (value > max) {
      return 'successTd';
    } else {
      return 'warningTd';
    }
  }


  returnSeverity(value: any, type: string) {
    let min: number = 0;
    let max: number = 0;

    if (type === 'avgLast10') {
      min = 0;
      max = 100000;
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
      return 'danger';
    } else if (max === 100000) {
      return 'success';
    } else if (value > max) {
      return 'success';
    } else {
      return 'warn';
    }
  }
  roundValue(value: any) {
    try {
      return value.toFixed(1);
    } catch (error) {
      return '-';
    }
  }
  redirectToPlayerDetail(player: any) {
    this.router.navigate(['/players' , player.player_id]);
  }

  capatlizeStats(value: string) {
    if (!value) return '';
    return value.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }

  getStatList() {
    this.statsLoader = true;
    this.sharedS.sendGetRequest('nba/stat/fields').subscribe({
      next: (res: any) => {
        this.statsLoader = false;
        if (res.status == 200) {
          this.statsList = res.body ?? [];
          this.filterForm.get('stats')?.setValue(this.statsList);
        }
      },
      error: (err: any) => {
        this.statsLoader = false;
      },
    });
  }
}
