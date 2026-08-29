import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CheckinPage } from './checkin.page';

const routes: Routes = [
  { path: '', component: CheckinPage },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CheckinRoutingModule {}
