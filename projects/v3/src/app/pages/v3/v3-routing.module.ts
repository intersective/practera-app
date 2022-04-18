import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TabsPage } from '../tabs/tabs.page';

import { V3Page } from './v3.page';

const routes: Routes = [
  {
    path: '',
    component: V3Page,
    children: [
      {
        path: '',
        loadChildren: () => import('../tabs/tabs.module').then(m => m.TabsPageModule),
      },
    ]
  },
  {
    path: '',
    redirectTo: '/v3',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class V3PageRoutingModule {}
