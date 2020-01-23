import { NgModule } from '@angular/core';
import { TopicComponent} from './topic.component';
import { TopicService } from './topic.service';
import { TopicRoutingModule } from './topic-routing.module';
import { FilestackModule } from '@shared/filestack/filestack.module';
import { SharedModule } from '@shared/shared.module';
import { ActivityModule } from '../activity/activity.module';

@NgModule({
  imports: [
    SharedModule,
    TopicRoutingModule,
    FilestackModule,
    ActivityModule
  ],
  declarations: [
    TopicComponent,
  ],
  providers: [
    TopicService
  ],
  exports: [
    SharedModule,
    FilestackModule,
    ActivityModule,
    TopicComponent,
  ]
})
export class TopicModule {}
