import {
  Component,
  EventEmitter,
  Input,
  input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Skeleton } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { Router } from '@angular/router';

@Component({
  selector: 'app-projection-table',
  standalone:true,
  imports: [TableModule, TagModule, Skeleton, TooltipModule],
  templateUrl: './projection-table.component.html',
  styleUrl: './projection-table.component.scss',
})
export class ProjectionTableComponent implements OnChanges {
  @Input() projectionData: any[] = [];
  @Input() projectionLoader: boolean = false;

  @Output() onPlayerClick = new EventEmitter<number>();

  constructor(private router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectionLoader']) {
      if (this.projectionLoader && !this.projectionData.length) {
        this.projectionData = Array.from({ length: 14 }).map(
          (_, i) => `Item #${i}`
        );
      } else {
        this.projectionData = this.projectionData;
      }
    }
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
      return 'danger';
    } else if (max === 100000) {
      return 'success';
    } else if (value > max) {
      return 'success';
    } else {
      return 'secondary';
    }
  }
  roundValue(value: any) {
    try {
      if (Number.isInteger(value)) {
        return value;
      }
      return parseFloat(value.toFixed(1));
    } catch (error) {
      return '-';
    }
  }
  redirectToPlayerDetail(player: any) {
    this.onPlayerClick.emit(player.player_id);
  }

  capatlizeStats(value: string) {
    if (!value) return '';
    return value.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }

  getInitials(fullName: string): string {
    if (!fullName) return 'N/A';
    return fullName
      .split(' ') // Split the name by spaces
      .map((name) => name[0]) // Take the first letter of each part
      .join('') // Combine the initials
      .toUpperCase(); // Convert to uppercase
  }
}
