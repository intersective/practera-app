import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../auth/auth.guard';

import { TabsComponent } from './tabs.component';
import { HomeComponent } from '../home/home.component';
import { ActivityComponent } from '../activity/activity.component';

const routes: Routes = [
  {
    path: 'app',
    component: TabsComponent,
    canActivate: [AuthGuard],    
    children: [
      {
        path: '',
        redirectTo: '/app/(home:home)',
        pathMatch: 'full'
      },
      {
        path: 'home',
        outlet: 'home',
        canActivateChild: [AuthGuard],
        component: HomeComponent
      },
      {
        path: 'project',
        outlet: 'project',
        loadChildren: '../project/project.module#ProjectModule',
        // component: ProjectComponent,
      },
      {
        path: 'activity/:id',
        outlet: 'project',
        canActivateChild: [AuthGuard],
        component: ActivityComponent
      },
      {
        path: 'chat',
        outlet: 'chat',
        // canActivateChild: [AuthGuard],
        loadChildren: '../chat/chat.module#ChatModule',
      },
      {
        path: 'help',
        outlet: 'help',
        loadChildren: '../help/help.module#HelpModule',
        // component: HelpComponent
      }
    ]
  }
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class TabsRoutingModule {}
