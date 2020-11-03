import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PreferenceComponent } from './preference.component';
import { PreferenceUpdateComponent } from './preference-update/preference-update.component';
import { PreferenceRoutingComponent } from './preference-routing.component';

const routes: Routes = [
  {
    path: '',
    component: PreferenceComponent,
    /*children: [
      {
        path: '',
        component: PreferenceComponent,
      },
      {
        path: 'update',
        component: PreferenceUpdateComponent,
      }
    ]*/
  },
  {
    path: 'update/:key',
    component: PreferenceUpdateComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PreferenceRoutingModule { }
