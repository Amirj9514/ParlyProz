import { Component, OnInit } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { SvgIconDirective } from '../../../Shared/directives/svg-icon.directive';
import { TooltipModule } from 'primeng/tooltip';
import { Router, RouterModule } from '@angular/router';
import { SharedService } from '../../../Shared/services/shared.service';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    DividerModule,
    AvatarModule,
    SvgIconDirective,
    TooltipModule,
    RouterModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  userDetail: any;
  constructor(private sharedS: SharedService , private router:Router) {}
  ngOnInit(): void {
    this.sharedS.getData().subscribe((data: any) => {
      this.userDetail = data?.userProfile ?? null;
      this.getNameFirstLetter();
    });

  }

  getNameFirstLetter() {
    if (this.userDetail) {
      let name = this.userDetail?.display_name ?? 'N/A';
      return name.charAt(0).toUpperCase();
    }
    return 'P';
  }

  logout(){
    console.log('logout');
  
    this.sharedS.insertData({key:'userProfile', val: null});
    this.sharedS.insertData({key:'token' , val:null});
    this.sharedS.insertData({key: 'game' ,  val:null});

    window.location.href = 'https://parlayproz.com/'
  }
}
