import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { SharedService } from '../../Shared/services/shared.service';
import { HeaderComponent } from '../projections/header/header.component';
import { JerseyDirective } from '../../Shared/directives/jersey.directive';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { SinglePlayerDetailComponent } from '../single-player-detail/single-player-detail.component';
import { ComingSoonComponent } from '../projections/coming-soon/coming-soon.component';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NhlSinglePlayerDetailComponent } from '../nhl-single-player-detail/nhl-single-player-detail.component';
import { MlbSinglePlayerDetailComponent } from "../mlb-single-player-detail/mlb-single-player-detail.component";

@Component({
  selector: 'app-player-list',
  standalone: true,
  imports: [
    HeaderComponent,
    JerseyDirective,
    TagModule,
    SkeletonModule,
    SinglePlayerDetailComponent,
    ComingSoonComponent,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    ReactiveFormsModule,
    CommonModule,
    NhlSinglePlayerDetailComponent,
    MlbSinglePlayerDetailComponent
],
  templateUrl: './player-list.component.html',
  styleUrl: './player-list.component.scss',
})
export class PlayerListComponent implements OnInit {
  @ViewChild('scrollObserver', { static: false }) scrollObserver!: ElementRef;
  selectedGame: string = 'mlb';
  playerList: any[] = [];
  playerListLoader: boolean = false;
  showComingSoon: boolean = false;
  isLoading = false;
  page = 1;
  limit = 60;
  totalPages = 0;
  searchControl = new FormControl('');

  seletedPlayer: number = 0;
  selectedPlayerDetail: any;

  constructor(private sharedS: SharedService) {}
  ngOnInit(): void {
    this.getDefaultGame();
    this.getPlayersList(false);
    this.searchControl.valueChanges.pipe(debounceTime(1000)).subscribe((value:any) => {
      if (value.trim()) {
        this.getPlayersList(false);
      }else{
        this.getPlayersList(false);
      }
    });


   
  }

  getDefaultGame() {
    this.sharedS.getData().pipe(take(1)).subscribe((data: any) => {
      this.selectedGame = data?.game.api ?? 'mlb';
    });
  }



  onGameChange(event: any) {
    this.showComingSoon = false;
    if (event) {
      this.selectedGame = event;
      this.getPlayersList(false);
      return;
    }

    this.showComingSoon = true;
  }

  getPlayersList(onScroll: boolean) {
    if (onScroll) {
      if (this.page > this.totalPages) return;
      this.page++;
      this.playerListLoader = true;
    } else {
      this.isLoading = true;
      this.page = 1;
    }
    this.sharedS
      .sendGetRequest(
        `${this.selectedGame}/players/list?limit=${this.limit}&offset=${this.page}&name=${this.searchControl.value}`
      )
      .subscribe({
        next: (res: any) => {
          this.playerListLoader = false;
          this.isLoading = false;
          if (res.status === 200) {
            const players = res.body?.players ?? [];
            if (onScroll) {
              this.page++;
              this.playerList = [...this.playerList, ...players];
              this.totalPages = res.body?.page_info?.total_pages ?? 0;
            } else {
              this.playerList = players ?? [];
              this.totalPages = res.body?.page_info?.total_pages ?? 0;
            }
          }
        },
        error: (error) => {
          this.playerListLoader = false;
          this.isLoading = false;
        },
      });
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    this.checkIfInView();
  }

  checkIfInView() {
    if (!this.scrollObserver) return;

    const rect = this.scrollObserver.nativeElement.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    if (rect.top <= windowHeight && rect.bottom >= 0 && !this.isLoading) {
      this.getPlayersList(true);
    }
  }

  loadPlayers() {
    console.log('loading more players');
  }
}
