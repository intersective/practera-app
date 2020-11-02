import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PreferenceComponent } from './preference.component';

const routes: Routes = [
  {
    path: '',
    component: PreferenceComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PreferenceRoutingModule { }
