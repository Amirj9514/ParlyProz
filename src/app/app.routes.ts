import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { ProjectionsComponent } from './projections/projections.component';
import { PlayerListComponent } from './player-list/player-list.component';
import { AuthComponent } from './auth/auth.component';

export const routes: Routes = [
    {
        path:'',
        component: LayoutComponent,
        children:[
            {
                path:'',
                component:ProjectionsComponent
            },
            {
                path:'players',
                component:PlayerListComponent
            }
        ]
    },
    {
        path:'login',
        component:AuthComponent
    }
];
