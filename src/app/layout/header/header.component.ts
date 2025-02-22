import { Component } from '@angular/core';
import { SvgIconDirective } from '../../../Shared/directives/svg-icon.directive';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [SvgIconDirective],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

}
