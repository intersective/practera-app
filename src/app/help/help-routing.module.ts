import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HelpComponent } from './help.component';
import { SettingComponent } from './setting/setting.component';

const routes: Routes = [
  { 
  	path: '', 
  	component: HelpComponent,
  	children: [
  	  {
  	    path: '',
  	    component: SettingComponent
  	  }
  	]
  }
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class HelpRoutingModule {}
