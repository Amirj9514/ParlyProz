import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SvgIconDirective } from '../../../Shared/directives/svg-icon.directive';
import { SelectModule } from 'primeng/select';
import { TeamService } from '../../../Shared/services/team.service';
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
    { label: 'NBA', icon: 'basketball', value: 'NBA', api: 'nba' },
    { label: 'WNBA', icon: 'basketball', value: 'wnba', api: 'wnba' },
    { label: 'NFL', icon: 'football', value: 'NFL', api: null },
    { label: 'Soccer', icon: 'soccer', value: 'Soccer', api: null },
    { label: 'NHL', icon: 'hockey', value: 'NHL', api: null },
  ];

  constructor(private teamS: TeamService) {
    this.selectedGame = this.games[0];
  }

  ngOnInit(): void {

    this.teamS.getUpdateDate().subscribe((data: any) => {
      console.log(data);
      
      this.updateTime = data;
    });
  }
  onChange(event: any) {
    this.onGameChange.emit(event.api);
  }

  handelSelectChange(event: any) {
    console.log(event);
  }
}
