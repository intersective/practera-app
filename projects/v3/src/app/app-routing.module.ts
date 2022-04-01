import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'experiences',
    loadChildren: () => import('./pages/experiences/experiences.module').then(m => m.ExperiencesPageModule)
  },
  {
    path: 'v3',
    loadChildren: () => import('./pages/v3/v3.module').then( m => m.V3PageModule)
  },
  {
    path: 'devtool',
    loadChildren: () => import('./pages/devtool/devtool.module').then( m => m.DevtoolPageModule)
  },
  {
    path: '',
    redirectTo: '/v3/home',
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
