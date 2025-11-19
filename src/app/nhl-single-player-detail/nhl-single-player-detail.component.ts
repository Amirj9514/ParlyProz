import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedService } from '../../Shared/services/shared.service';
import { PlayerService } from '../../Shared/services/player.service';
import { TeamService } from '../../Shared/services/team.service';
import { PlayerStatsService } from '../../Shared/services/player-stats.service';
import { forkJoin } from 'rxjs';
import { NhlService } from '../../Shared/services/nhl.service';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { NhlPlayerCardComponent } from "./nhl-player-card/nhl-player-card.component";
import { NhlPlayerDetailCardComponent } from "./nhl-player-detail-card/nhl-player-detail-card.component";
import { NhlPlayerTableComponent } from "./nhl-player-table/nhl-player-table.component";
import { NhlTeamGraphComponent } from "./nhl-team-graph/nhl-team-graph.component";

@Component({
  selector: 'app-nhl-single-player-detail',
  standalone: true,
  imports: [ButtonModule, SkeletonModule, NhlPlayerCardComponent, NhlPlayerDetailCardComponent, NhlPlayerTableComponent, NhlTeamGraphComponent],
  templateUrl: './nhl-single-player-detail.component.html',
  styleUrl: './nhl-single-player-detail.component.scss',
})
export class NhlSinglePlayerDetailComponent {
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
    private nhlService: NhlService // Assuming you have a service for NHL
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

  getPlayerDetails(team: string = 'LAL') {
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
