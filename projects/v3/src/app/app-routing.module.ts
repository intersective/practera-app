import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'experiences',
    loadChildren: () => import('./pages/experiences/experiences.module').then(m => m.ExperiencesPageModule)
  },
  {
    path: 'v3',
    loadChildren: () => import('./pages/v3/v3.module').then( m => m.V3PageModule)
  },
  {
    path: 'topic-mobile',
    loadChildren: () => import('./pages/topic-mobile/topic-mobile.module').then(m => m.TopicMobilePageModule)
  },
  {
    path: 'assessment-mobile',
    loadChildren: () => import('./pages/assessment-mobile/assessment-mobile.module').then(m => m.AssessmentMobilePageModule)
  },
  {
    path: 'devtool',
    loadChildren: () => import('./pages/devtool/devtool.module').then( m => m.DevtoolPageModule)
  },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  {
    path: '**',
    loadChildren: () => import('./pages/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
