import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SharedService } from '../../Shared/services/shared.service';
import { DetailsCardComponent } from './details-card/details-card.component';
import { PlayerService } from '../../Shared/services/player.service';
import { TableComponent } from '../single-player-detail/table/table.component';
import { ButtonModule } from 'primeng/button';
import { forkJoin } from 'rxjs';
import { SkeletonModule } from 'primeng/skeleton';
import { TeamService } from '../../Shared/services/team.service';
import { TeamGraphComponent } from './team-graph/team-graph.component';
import { PlayerStatsService } from '../../Shared/services/player-stats.service';
import { PlayerStatsGraphComponent } from "./player-stats-graph/player-stats-graph.component";

@Component({
  selector: 'app-single-player-detail',
  standalone: true,
  imports: [
    DetailsCardComponent,
    TableComponent,
    ButtonModule,
    SkeletonModule,
    TeamGraphComponent,

    PlayerStatsGraphComponent
],
  templateUrl: './single-player-detail.component.html',
  styleUrl: './single-player-detail.component.scss',
})
export class SinglePlayerDetailComponent implements OnInit {
  @Input() selectedPlayerId: number = 0;
  @Output() onClose = new EventEmitter();
  playerDetail: any[] = [];
  teamDetail: any[] = [];
  playerDetailLoader: boolean = false;
  teamGraphLoader: boolean = false;
  constructor(
    private sharedS: SharedService,
    private playerS: PlayerService,
    private teamS: TeamService,
    private playerStatsS: PlayerStatsService
  ) {}

  ngOnInit(): void {
    this.getPlayerDetailWithLineStats();
  }

  getPlayerDetailWithLineStats() {
    this.playerDetailLoader = true;

    const lineStats$ = this.sharedS.sendGetRequest(
      `nba/players/${this.selectedPlayerId}/lines`
    );
    const playerDetail$ = this.sharedS.sendGetRequest(
      `nba/players/stats/${this.selectedPlayerId}?season=2024-25`
    ); // Example of another API call

    forkJoin([lineStats$, playerDetail$]).subscribe({
      next: ([lineStatsRes, playerDetailRes]: any) => {
        this.playerDetailLoader = false;
        if (lineStatsRes.status === 200 && playerDetailRes.status === 200) {
          this.playerS.setLineStats(lineStatsRes.body);
          this.playerDetail = playerDetailRes.body ?? [];
          this.playerS.setPlayerData(this.playerDetail);
          this.playerStatsS.setPlayerData(this.playerDetail);
          this.playerStatsS.setLineStats(lineStatsRes.body);
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
      .sendGetRequest(`nba/team/stats/${team}?season=2024-25`)
      .subscribe({
        next: (res: any) => {
          this.teamGraphLoader = false;
          if (res.status === 200) {
            this.teamDetail = res.body ?? [];
            this.teamS.setTeamData(this.teamDetail);
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
