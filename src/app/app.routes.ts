import { Routes } from '@angular/router';
import { PlayersComponent } from './players/players.component';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
    {
        path: '',
        component:LayoutComponent
    },
    {
        path:'players',
        component:PlayersComponent
    }
];
