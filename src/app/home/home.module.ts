import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HomeComponent } from './home.component';
import { ActivityCardComponent } from '../components/activity-card/activity-card.component';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { TodoNotificationCardComponent } from '../components/todo-notification-card/todo-notification-card.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    NgCircleProgressModule.forRoot({
      "backgroundColor": "#f4f5f8",
      "subtitleColor": "#444444",
      
    }),
    RouterModule.forChild([{ path: '', component: HomeComponent }])
  ],
  declarations: [HomeComponent, ActivityCardComponent, TodoNotificationCardComponent],
 
})
export class HomeModule {
}
