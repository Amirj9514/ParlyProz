import { Component } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { SvgIconDirective } from '../../../Shared/directives/svg-icon.directive';
import { TooltipModule } from 'primeng/tooltip';
@Component({
  selector: 'app-sidebar',
  standalone:true,
  imports: [DividerModule ,AvatarModule , SvgIconDirective , TooltipModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

}
