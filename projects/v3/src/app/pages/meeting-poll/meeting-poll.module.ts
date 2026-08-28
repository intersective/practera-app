import { NgModule } from '@angular/core';
import { MeetingPollPage } from './meeting-poll.page';
import { MeetingPollRoutingModule } from './meeting-poll-routing.module';
import { ComponentsModule } from '@v3/app/components/components.module';
import { PersonalisedHeaderModule } from '@v3/app/personalised-header/personalised-header.module';

@NgModule({
  imports: [
    ComponentsModule,
    MeetingPollRoutingModule,
    PersonalisedHeaderModule,
  ],
  declarations: [MeetingPollPage],
})
export class MeetingPollModule {}
