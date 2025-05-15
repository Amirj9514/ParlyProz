import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedService } from '../../Shared/services/shared.service';
import { forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { MlbService } from '../../Shared/services/mlb.service';
import { CommonModule } from '@angular/common';
import { MlbPlayerCardComponent } from "./mlb-player-card/mlb-player-card.component";
import { MlbTeamGraphComponent } from "./mlb-team-graph/mlb-team-graph.component";
import { MlbPlayerTableComponent } from "./mlb-player-table/mlb-player-table.component";
import { MlbPlayerDetailCardComponent } from "./mlb-player-detail-card/mlb-player-detail-card.component";

@Component({
  selector: 'app-mlb-single-player-detail',
  standalone: true,
  imports: [ButtonModule, SkeletonModule, CommonModule, MlbPlayerCardComponent, MlbTeamGraphComponent, MlbPlayerTableComponent, MlbPlayerDetailCardComponent],
  templateUrl: './mlb-single-player-detail.component.html',
  styleUrl: './mlb-single-player-detail.component.scss',
})
export class MlbSinglePlayerDetailComponent {
  @Input() selectedPlayerId: number = 0;
  @Input() selectedPlayerDetail: any;
  @Input() selectedSport: string = 'nba';
  @Output() onClose = new EventEmitter();
  @Input() selectedPlayer: any;
  playerDetail: any[] = [];
  teamDetail: any[] = [];
  playerDetailLoader: boolean = false;
  teamGraphLoader: boolean = false;
  constructor(
    private sharedS: SharedService,
    private nhlService: MlbService // Assuming you have a service for NHL
  ) {}

  ngOnInit(): void {
    this.getPlayerDetailWithLineStats();
  }

  getPlayerDetailWithLineStats() {
    this.playerDetailLoader = true;
    const lineStats$ = this.sharedS.sendGetRequest(
      `${this.selectedSport}/players/${this.selectedPlayerId}/lines`
    );
    const playerDetail$ = this.sharedS.sendGetRequest(
      `${this.selectedSport}/players/stats/${this.selectedPlayerId}?season=2024-25`
    ); // Example of another API call

    forkJoin([lineStats$, playerDetail$]).subscribe({
      next: ([lineStatsRes, playerDetailRes]: any) => {
        this.playerDetailLoader = false;
        if (lineStatsRes.status === 200 && playerDetailRes.status === 200) {
          this.nhlService.setLineStats(lineStatsRes.body);
          this.playerDetail = playerDetailRes.body ?? [];

          this.nhlService.setPlayerData(this.playerDetail);
          // this.playerStatsS.setPlayerData(this.playerDetail);
          // this.playerStatsS.setLineStats(lineStatsRes.body);
          const playerTeam = this.playerDetail[0]?.team || 'LAL';
          this.getPlayerDetails(playerTeam);
        }
      },
      error: (error) => {
        this.playerDetailLoader = false;
      },
    });
  }

  getPlayerDetails(team: string = 'HITS') {
    this.teamGraphLoader = true;
    this.sharedS
      .sendGetRequest(`${this.selectedSport}/team/stats/${team}?season=2024-25`)
      .subscribe({
        next: (res: any) => {
          this.teamGraphLoader = false;
          if (res.status === 200) {
            this.teamDetail = res.body ?? [];
            this.nhlService.setTeamData(this.teamDetail);
          }
        },
        error: (error) => {
          this.teamGraphLoader = false;
        },
      });
  }

  goback() {
    this.onClose.emit();
  }
}
