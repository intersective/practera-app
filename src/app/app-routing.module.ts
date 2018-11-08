import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: './auth/auth.module#AuthModule' },
  { path: 'switcher', loadChildren: './switcher/switcher.module#SwitcherModule' },
  { path: 'pages', loadChildren: './tabs/tabs.module#TabsModule' },
  { path: 'chat', loadChildren: './chat/chat.module#ChatModule' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
