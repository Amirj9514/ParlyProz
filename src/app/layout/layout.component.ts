import { Component } from '@angular/core';
import { SidebarComponent } from "./sidebar/sidebar.component";
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';


@Component({
  selector: 'app-layout',
  standalone:true,
  imports: [SidebarComponent, RouterOutlet, HeaderComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {

}
