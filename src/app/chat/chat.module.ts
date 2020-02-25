import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { ChatComponent } from './chat.component';
import { ChatListComponent } from './chat-list/chat-list.component';
import { ChatRoomComponent } from './chat-room/chat-room.component';
import { ChatPreviewComponent } from './chat-preview/chat-preview.component';
import { ChatRoutingModule } from './chat-routing.module';
import { ChatService } from './chat.service';
import { FilestackModule } from '../shared/filestack/filestack.module';
import { FastFeedbackModule } from '../fast-feedback/fast-feedback.module';
import { AutoresizeDirective } from '../shared/directives/autoresize/autoresize.directive';
import { ChatViewComponent } from './chat-view/chat-view.component';

@NgModule({
  imports: [
    SharedModule,
    ChatRoutingModule,
    FilestackModule,
    FastFeedbackModule,
  ],
  declarations: [
    ChatComponent,
    ChatListComponent,
    ChatPreviewComponent,
    ChatRoomComponent,
    AutoresizeDirective,
    ChatViewComponent
  ],
  entryComponents: [ChatPreviewComponent],
  providers: [ChatService],
  exports: [
    SharedModule,
    FilestackModule,
    ChatRoomComponent,
    FastFeedbackModule
  ]
})
export class ChatModule {}
