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
    path: '',
    loadChildren: './tabs/tabs.module#TabsModule',
    canLoad: [AuthGuard]
  },
  { 
    path: 'chat', 
    loadChildren: './chat/chat.module#ChatModule' 
  },
  { path: '**', component: PageNotFoundComponent }
];
@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false, // <-- debugging purposes only
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
