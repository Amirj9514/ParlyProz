import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SvgIconDirective } from '../../../Shared/directives/svg-icon.directive';
import { SelectModule } from 'primeng/select';
@Component({
  selector: 'app-header',
  standalone:true,
  imports: [SelectButtonModule , FormsModule , SvgIconDirective , SelectModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  @Output() onGameChange = new EventEmitter<any>();
  selectedGame: string = 'NBA';
  games: any[] = [
    { label: 'NBA', icon: 'basketball' , value:'NBA' , api:'nba' },
    { label: 'CBB', icon: 'basketball' , value:'CBB' , api:null },
    { label: 'NFL', icon: 'football' , value:'NFL',api:null },
    { label: 'Soccer', icon: 'soccer' , value:'Soccer',api:null },
    { label: 'NHL', icon: 'hockey' , value:'NHL',api:null },
  ];

  constructor(){
    this.selectedGame = this.games[0];
  }

  onChange(event: any) {
    this.onGameChange.emit(event.api);
  }

  handelSelectChange(event:any){
    console.log(event);
    
  }
}
