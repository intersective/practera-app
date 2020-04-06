import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';
import { TabsComponent } from './tabs.component';

const routes: Routes = [
  {
    path: 'app',
    component: TabsComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'home',
        children: [
          {
            path: '',
            loadChildren: '../overview/overview.module#OverviewModule',
          }
        ]
      },
      {
        path: 'events',
        children: [
          {
            path: '',
            loadChildren: '../events/events.module#EventsModule',
          }
        ]
      },
      {
        path: 'activity',
        children: [
          {
            path: '',
            loadChildren: '../tasks/tasks.module#TasksModule'
          }
        ]
      },
      {
        path: 'reviews',
        children: [
          {
            path: '',
            loadChildren: '../reviews/reviews.module#ReviewsModule'
          }
        ]
      },
      {
        path: 'chat',
        children: [
          {
            path: '',
            loadChildren: '../chat/chat.module#ChatModule',
          }
        ]
      },
      {
        path: 'settings',
        children: [
          {
            path: '',
            loadChildren: '../settings/settings.module#SettingsModule'
          }
        ]
      },
      {
        path: '',
        redirectTo: '/app/home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/app/home',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class TabsRoutingModule {}
