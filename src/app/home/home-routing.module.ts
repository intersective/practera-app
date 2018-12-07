import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home.component';
import { HomeRoutingComponent } from './home-routing.component';

const routes: Routes = [
  {
    path: '',
    component: HomeRoutingComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
      }
	]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule {}