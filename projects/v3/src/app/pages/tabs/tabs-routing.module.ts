import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../home/home.module').then(m => m.HomePageModule)
      },
      {
        path: 'messages',
        loadChildren: () => import('../chat/chat.module').then(m => m.ChatModule)
      },
      {
        path: 'settings',
        children: [
          {
            path: '',
            loadChildren: () => import('../settings/settings.module').then(m => m.SettingsPageModule)
          },
          {
            path: 'slide',
            loadChildren: () => import('../settings-slide/settings-slide.module').then(m => m.SettingsSlidePageModule)
          }
        ]
      },
      {
        path: 'reviews',
        loadChildren: () => import('../reviews/reviews.module').then(m => m.ReviewsPageModule)
      },
      {
        path: 'events',
        loadChildren: () => import('../events/events.module').then(m => m.EventsPageModule)
      },
      {
        path: 'activity-desktop',
        loadChildren: () => import('../activity-desktop/activity-desktop.module').then(m => m.ActivityDesktopPageModule)
      },
      {
        path: 'activity-mobile',
        loadChildren: () => import('../activity-mobile/activity-mobile.module').then(m => m.ActivityMobilePageModule)
      },
    ]
  },
  {
    path: '',
    redirectTo: '/app/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
