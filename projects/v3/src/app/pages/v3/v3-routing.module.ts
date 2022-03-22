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
        loadChildren: () => import('../tabs/tabs.module').then( m => m.TabsPageModule ),
      },
      {
        path: 'assessment',
        loadChildren: () => import('../assessment/assessment.module').then(m => m.AssessmentPageModule)
      },
      {
        path: 'settings',
        loadChildren: () => import('../settings/settings.module').then(m => m.SettingsPageModule),
        outlet: 'settings'
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class V3PageRoutingModule {}
