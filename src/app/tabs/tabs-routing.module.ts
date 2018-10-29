import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TabsComponent } from './tabs.component';
import { HomeComponent } from '../home/home.component';
import { ActivitiesComponent } from '../activities/activities.component';
import { ChatListComponent } from '../chat/chat-list/chat-list.component';
import { HelpComponent } from '../help/help.component';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsComponent,
    children: [
      {
        path: '',
        redirectTo: '/pages/tabs/(home:home)',
        pathMatch: 'full'
      },
      {
        path: 'home',
        outlet: 'home',
        component: HomeComponent
      },
      {
        path: 'activities',
        outlet: 'activities',
        component: ActivitiesComponent
      },
      {
        path: 'chat',
        outlet: 'chat',
        component: ChatListComponent
      },
      {
        path: 'help',
        outlet: 'help',
        component: HelpComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsRoutingModule {}
