import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { QuillModule } from 'ngx-quill';

import { ChatPage } from './chat.page';
import { ChatListComponent } from './chat-list/chat-list.component';
import { ChatRoomComponent } from './chat-room/chat-room.component';
import { ChatPreviewComponent } from './chat-preview/chat-preview.component';
import { ChatRoutingModule } from './chat-routing.module';
import { ChatService } from '@v3/services/chat.service';
import { FilestackService } from '@v3/services/filestack.service';
import { FastFeedbackService } from '@v3/services/fast-feedback.service';
import { ChatViewComponent } from './chat-view/chat-view.component';
import { ChatInfoComponent } from './chat-info/chat-info.component';
import { ComponentsModule } from '../../components/components.module';
import { PersonalisedHeaderModule } from '@v3/app/personalised-header/personalised-header.module';

@NgModule({
  imports: [
    ComponentsModule,
    ChatRoutingModule,
    PersonalisedHeaderModule,
    QuillModule.forRoot()
  ],
  declarations: [
    ChatPage,
    ChatListComponent,
    ChatPreviewComponent,
    ChatRoomComponent,
    ChatViewComponent,
    ChatInfoComponent
  ],
  entryComponents: [ChatPreviewComponent, ChatInfoComponent],
  providers: [],
  exports: [
    ChatRoomComponent,
  ]
})
export class ChatModule {}
