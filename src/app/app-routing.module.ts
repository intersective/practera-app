import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GoMobileComponent } from './go-mobile/go-mobile.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { FastFeedbackComponent } from './fast-feedback/fast-feedback.component';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  { 
    path: 'go-mobile', 
    component: GoMobileComponent,
  },
  { 
    path: 'switcher', 
    loadChildren: './switcher/switcher.module#SwitcherModule',
  },
  { 
    path: 'topic', 
    loadChildren: './topic/topic.module#TopicModule',
  },
  {
    path: 'assessment', 
    loadChildren: './assessment/assessment.module#AssessmentModule',
  },
  { 
    path: 'fast-feedback',
    component: FastFeedbackComponent,
  },
  {
    path: 'chat', 
    loadChildren: './chat/chat.module#ChatModule' 
  },
  {
    path: '', 
    loadChildren: './tabs/tabs.module#TabsModule',
    canLoad: [AuthGuard]
  },
  {
    path: '',
    redirectTo: '/app',
    pathMatch: 'full',
    canLoad: [AuthGuard]
  },
  { path: '**', component: PageNotFoundComponent },
];
@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false, // <-- debugging purposes only
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
