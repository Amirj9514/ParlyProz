import { Component } from '@angular/core';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-card1',
  standalone: true,
    imports: [TableModule],
  templateUrl: './card1.component.html',
  styleUrl: './card1.component.scss'
})
export class Card1Component {
  products:any[]=[1];
}
