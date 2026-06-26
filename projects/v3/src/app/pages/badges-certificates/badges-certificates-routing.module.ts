import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BadgesCertificatesPage } from './badges-certificates.page';

const routes: Routes = [
  {
    path: '',
    component: BadgesCertificatesPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BadgesCertificatesPageRoutingModule {}
