import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TopicComponent} from './topic.component';
import { TopicService } from './topic.service';
import { TopicRoutingModule } from './topic-routing.module';
import { FilestackModule } from '@shared/filestack/filestack.module';
import { SharedModule } from '@shared/shared.module';
import { ActivityModule } from '../activity/activity.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TopicRoutingModule,
    FilestackModule,
    SharedModule,
    ActivityModule
  ],
  declarations: [
    TopicComponent,
  ],
  providers: [
    TopicService
  ],
  exports: [
    IonicModule,
    CommonModule,
    FormsModule,
    FilestackModule,
    SharedModule,
    ActivityModule
  ]
})
export class TopicModule {}
