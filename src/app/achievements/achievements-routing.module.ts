import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AchievementsComponent } from './achievements.component';

const routes: Routes = [
  {
    path: '',
    component: AchievementsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AchievementsRoutingModule {}
