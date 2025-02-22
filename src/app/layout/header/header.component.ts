import { Component, ViewChild } from '@angular/core';
import { SvgIconDirective } from '../../../Shared/directives/svg-icon.directive';
import { Drawer, DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [SvgIconDirective ,DrawerModule ,ButtonModule , RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  visible = false;
  @ViewChild('drawerRef') drawerRef!: Drawer;

  closeCallback(e:any): void {
      this.drawerRef.close(e);
  }

}
