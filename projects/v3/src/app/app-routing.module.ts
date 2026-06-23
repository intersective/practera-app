import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { DevOnlyGuard } from './guards/dev-only.guard';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'experiences',
    loadChildren: () => import('./pages/experiences/experiences.module').then(m => m.ExperiencesPageModule),
    canMatch: [AuthGuard],
  },
  {
    path: 'v3',
    loadChildren: () => import('./pages/v3/v3.module').then( m => m.V3PageModule),
    canMatch: [AuthGuard],
  },
  {
    path: 'topic-mobile',
    loadChildren: () => import('./pages/topic-mobile/topic-mobile.module').then(m => m.TopicMobilePageModule),
    canMatch: [AuthGuard],
  },
  {
    path: 'assessment-mobile',
    loadChildren: () => import('./pages/assessment-mobile/assessment-mobile.module').then(m => m.AssessmentMobilePageModule),
    canMatch: [AuthGuard],
  },
  {
    path: 'devtool',
    loadChildren: () => import('./pages/devtool/devtool.module').then( m => m.DevtoolPageModule),
    canMatch: [DevOnlyGuard],
  },
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    loadChildren: () => import('./pages/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
