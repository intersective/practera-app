import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GoMobileComponent } from './go-mobile/go-mobile.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { FastFeedbackComponent } from './fast-feedback/fast-feedback.component';
import { DeviceInfoComponent } from './device-info/device-info.component';
import { AuthGuard } from './auth/auth.guard';
import { ProgramSelectedGuard } from './auth/program-selected.guard';
import { UserResolverService } from '@services/user-resolver.service';

const routes: Routes = [
  {
    path: 'go-mobile',
    component: GoMobileComponent,
    canLoad: [AuthGuard],
    resolve: {
      user: UserResolverService,
    },
  },
  {
    path: 'switcher',
    loadChildren: './switcher/switcher.module#SwitcherModule',
    canLoad: [AuthGuard]
  },
  {
    path: 'topic',
    loadChildren: './topic/topic.module#TopicModule',
    canLoad: [AuthGuard]
  },
  {
    path: 'assessment',
    loadChildren: './assessment/assessment.module#AssessmentModule',
    canLoad: [AuthGuard]
  },
  {
    path: 'achievements',
    loadChildren: './achievements/achievements.module#AchievementsModule',
    canLoad: [AuthGuard]
  },
  {
    path: 'fast-feedback',
    component: FastFeedbackComponent,
    canLoad: [AuthGuard]
  },
  {
    path: 'chat',
    loadChildren: './chat/chat.module#ChatModule',
    canLoad: [AuthGuard]
  },
  {
    path: 'preferences',
    loadChildren: './preference/preference.module#PreferenceModule',
    canLoad: [AuthGuard],
  },
  {
    path: 'device-info',
    component: DeviceInfoComponent,
  },
  {
    path: '',
    loadChildren: './tabs/tabs.module#TabsModule',
    canLoad: [AuthGuard],
    canActivate: [ProgramSelectedGuard],
  },
  {
    path: '',
    redirectTo: '/app',
    pathMatch: 'full',
    canLoad: [AuthGuard]
  },
  { path: '**', component: PageNotFoundComponent },
];
@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false, // <-- debugging purposes only
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled',
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
