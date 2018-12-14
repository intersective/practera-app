import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TopicComponent} from './topic.component';
import { TopicService } from './topic.service';
import { TopicRoutingModule } from './topic-routing.module';



@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TopicRoutingModule
  ],
  declarations: [
    TopicComponent
  ],
  providers: [
   TopicService
  ]
})
export class TopicModule {}
