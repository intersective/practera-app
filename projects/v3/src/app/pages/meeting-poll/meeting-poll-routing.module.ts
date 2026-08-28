import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MeetingPollPage } from './meeting-poll.page';

const routes: Routes = [
  {
    path: '',
    component: MeetingPollPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MeetingPollRoutingModule {}
