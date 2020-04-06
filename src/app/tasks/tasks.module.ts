import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { TasksRoutingComponent } from './tasks-routing.component';

import { TasksRoutingModule } from './tasks-routing.module';
import { TasksComponent } from './tasks.component';
import { ActivityModule } from '../activity/activity.module';
import { TopicModule } from '../topic/topic.module';
import { AssessmentModule } from '../assessment/assessment.module';

@NgModule({
  declarations: [
    TasksComponent,
    TasksRoutingComponent
  ],
  imports: [
    SharedModule,
    TasksRoutingModule,
    ActivityModule,
    TopicModule,
    AssessmentModule
  ]
})
export class TasksModule { }
