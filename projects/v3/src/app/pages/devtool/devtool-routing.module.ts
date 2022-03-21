import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DevtoolPage } from './devtool.page';

const routes: Routes = [
  {
    path: '',
    component: DevtoolPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DevtoolPageRoutingModule {}
