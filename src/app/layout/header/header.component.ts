import { Component, OnInit, ViewChild } from '@angular/core';
import { SvgIconDirective } from '../../../Shared/directives/svg-icon.directive';
import { Drawer, DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { TeamService } from '../../../Shared/services/team.service';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [SvgIconDirective ,DrawerModule ,ButtonModule , RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  updateDate: string = '';
  visible = false;
  @ViewChild('drawerRef') drawerRef!: Drawer;

  closeCallback(e:any): void {
      this.drawerRef.close(e);
  }

  constructor(private teamS: TeamService) {}
  ngOnInit(): void {
    
    this.teamS.getUpdateDate().subscribe((data: any) => {
      this.updateDate = data;
    });
  }
}
