import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { H5PPage } from './h5p.page';

const routes: Routes = [
  {
    path: '',
    component: H5PPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class H5PPageRoutingModule { }
