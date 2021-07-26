import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GoMobileComponent } from './go-mobile/go-mobile.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { FastFeedbackComponent } from './fast-feedback/fast-feedback.component';
import { DeviceInfoComponent } from './device-info/device-info.component';
import { AuthGuard } from './auth/auth.guard';
import { ProgramSelectedGuard } from './auth/program-selected.guard';

const routes: Routes = [
  {
    path: 'go-mobile',
    component: GoMobileComponent,
    canLoad: [AuthGuard],
  },
  {
    path: 'switcher',
    loadChildren: () => import('./switcher/switcher.module').then(m => m.SwitcherModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'topic',
    loadChildren: () => import('./topic/topic.module').then(m => m.TopicModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'assessment',
    loadChildren: () => import('./assessment/assessment.module').then(m => m.AssessmentModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'achievements',
    loadChildren: () => import('./achievements/achievements.module').then(m => m.AchievementsModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'activity-task',
    loadChildren: () => import('./tasks/tasks.module').then(m => m.TasksModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'settings-embed',
    loadChildren: () => import('./settings-embed/settings-embed.module').then(m => m.SettingsEmbedModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'fast-feedback',
    component: FastFeedbackComponent,
    canLoad: [AuthGuard]
  },
  {
    path: 'chat',
    loadChildren: () => import('./chat/chat.module').then(m => m.ChatModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'device-info',
    component: DeviceInfoComponent,
  },
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsModule),
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
