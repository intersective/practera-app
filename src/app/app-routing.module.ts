import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  // { path: '', reidr}
  // { path: '', loadChildren: './auth/auth.module#AuthModule' },
  { 
  	path: 'switcher', 
  	loadChildren: './switcher/switcher.module#SwitcherModule',
  },
  { 
  	path: 'topic', 
  	loadChildren: './topic/topic.module#TopicModule',
  },
  { 
  	path: 'tabs',  
  	loadChildren: './tabs/tabs.module#TabsModule',
  	canLoad: [AuthGuard],
  },
  { path: '', redirectTo: 'tabs', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];
@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false, // <-- debugging purposes only
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
