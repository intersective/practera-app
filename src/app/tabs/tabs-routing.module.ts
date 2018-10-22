import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TabsComponent } from './tabs.component';
import { HomeComponent } from '../home/home.component';
import { ActivitiesComponent } from '../activities/activities.component';
import { ChatComponent } from '../chat/chat.component';
import { HelpComponent } from '../help/help.component';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsComponent,
    children: [
      {
        path: '',
        redirectTo: '/tabs/(home:home)',
        pathMatch: 'full',
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
        component: ChatComponent
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
