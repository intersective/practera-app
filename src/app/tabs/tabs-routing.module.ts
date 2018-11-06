import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TabsComponent } from './tabs.component';
import { HomeComponent } from '../home/home.component';
import { ProjectComponent } from '../project/project.component';
import { ChatComponent } from '../chat/chat.component';
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
        path: 'project',
        outlet: 'project',
        component: ProjectComponent
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
