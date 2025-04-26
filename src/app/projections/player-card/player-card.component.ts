import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, } from '@angular/core';
import { CommonService } from '../../../Shared/services/common.service';

@Component({
  selector: 'app-player-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-card.component.html',
  styleUrl: './player-card.component.scss'
})
export class PlayerCardComponent {
  @Input() player: any;
  @Output() onPlayerClick = new EventEmitter<number>();
  constructor(public commonS:CommonService){}


  redirectToPlayerDetail(player: any) {
    this.onPlayerClick.emit(player);
  }

  capatlizeStats(value: string) {
    if (!value) return '';
    return value.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }

  getInitials(fullName: string): string {
    if (!fullName) return 'N/A';
    return fullName
      .split(' ')
      .map((name) => name[0])
      .join('')
      .toUpperCase();
  }

  returnSeverity(value: any, type: string, line?: any) {
    let min: number = 0;
    let max: number = 0;

    if (type === 'avgLast10') {
      min = line;
      max = line;
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
      return 'danger-td2';
    } else if (max === 100000) {
      return 'success-td2';
    } else if (value > max) {
      return 'success-td2';
    } else {
      return 'warning-td2';
    }
  }
  roundValue(value: any) {
    try {
      if (Number.isInteger(value)) {
        return value;
      }
      return parseFloat(value.toFixed(1));
    } catch (error) {
      return '--';
    }
  }
}
