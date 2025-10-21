import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SvgIconDirective } from '../../../Shared/directives/svg-icon.directive';
import { SelectModule } from 'primeng/select';
import { TeamService } from '../../../Shared/services/team.service';
import { SharedService } from '../../../Shared/services/shared.service';
import { take } from 'rxjs';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [SelectButtonModule, FormsModule, SvgIconDirective, SelectModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  updateTime: string = '';
  @Output() onGameChange = new EventEmitter<any>();
  selectedGame: string = 'NBA';

  games: any[] = [
    
    {
      label: 'MLB',
      icon: 'baseball',
      value: 'MLB',
      api: 'mlb',
      constant: false,
    },
    { label: 'NFL', icon: 'football', value: 'NFL', api: 'nfl', constant: false },
    {
      label: 'WNBA',
      icon: 'basketball',
      value: 'wnba',
      api: 'wnba',
      constant: false,
    },
    { label: 'NHL', icon: 'hockey', value: 'NHL', api: 'nhl', constant: false },
    {
      label: 'NBA',
      icon: 'basketball',
      value: 'NBA',
      api: 'mlb',
      constant: false,
    },
    
    {
      label: 'Soccer',
      icon: 'soccer',
      value: 'Soccer',
      api: null,
      constant: true,
    },
  ];

  constructor(private teamS: TeamService, private SharedS: SharedService) {}

  ngOnInit(): void {
    this.teamS.getUpdateDate().subscribe((data: any) => {
      this.updateTime = data;
    });

    this.getDefalutGame();
  }

  getDefalutGame() {
    this.SharedS.getData()
      .pipe(take(1))
      .subscribe((data: any) => {
        this.selectedGame = data?.game ?? this.games[0];
      });
  }
  onChange(event: any) {
    this.SharedS.insertData({ key: 'game', val: event });
    this.onGameChange.emit(event.api);
  }

  handelSelectChange(event: any) {}

  disableGame(game: any) {
    return game.constant;
  }
}
