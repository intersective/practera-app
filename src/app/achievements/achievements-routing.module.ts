import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserResolverService } from '@services/user-resolver.service';
import { AchievementsComponent } from './achievements.component';

const routes: Routes = [
  {
    path: '',
    component: AchievementsComponent,
    resolve: {
      user: UserResolverService
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AchievementsRoutingModule {}
