import { inject, NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    // Ionic caches tab pages, so ngOnInit does not run on every visit.
    // Route titles are reapplied on each successful navigation.
    children: [
      {
        path: 'home',
        title: () => inject(UtilsService).decodeHtmlEntities(
          inject(BrowserStorageService).get('experience')?.name || 'Practera'
        ),
        loadChildren: () => import('../home/home.module').then(m => m.HomePageModule)
      },
      {
        path: 'messages',
        title: 'Messages - Practera',
        loadChildren: () => import('../chat/chat.module').then(m => m.ChatModule)
      },
      {
        path: 'review-desktop',
        loadChildren: () => import('../review-desktop/review-desktop.module').then(m => m.ReviewDesktopPageModule)
      },
      {
        path: 'reviews',
        title: 'Reviews - Practera',
        loadChildren: () => import('../review-mobile/review-mobile.module').then(m => m.ReviewMobilePageModule)
      },
      {
        path: 'events',
        title: 'Events - Practera',
        loadChildren: () => import('../events/events.module').then(m => m.EventsPageModule)
      },
      {
        path: 'due-dates',
        title: 'Due Dates - Practera',
        loadChildren: () => import('../due-dates/due-dates.module').then(m => m.DueDatesModule)
      },
      {
        path: 'activity-desktop',
        loadChildren: () => import('../activity-desktop/activity-desktop.module').then(m => m.ActivityDesktopPageModule)
      },
      {
        path: 'activity-mobile',
        loadChildren: () => import('../activity-mobile/activity-mobile.module').then(m => m.ActivityMobilePageModule)
      },
      {
        path: 'notifications',
        title: 'Notifications - Practera',
        children: [
          {
            path: '',
            loadChildren: () => import('../notifications/notifications.module').then(m => m.NotificationsPageModule)
          },
        ],
      },
      {
        path: 'settings',
        title: 'Settings - Practera',
        children: [
          {
            path: '',
            loadChildren: () => import('../settings/settings.module').then(m => m.SettingsPageModule)
          },
        ]
      },
      {
        path: 'badges-certificates',
        title: 'Badges & Certificates - Practera',
        loadChildren: () => import('../badges-certificates/badges-certificates.module').then(m => m.BadgesCertificatesPageModule)
      },
      {
        path: '',
        redirectTo: '/v3/home',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
