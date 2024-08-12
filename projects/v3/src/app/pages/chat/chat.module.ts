import { NgModule } from '@angular/core';

import MagicUrl from 'quill-magic-url';
import Quill from 'quill';
import { QuillModule } from 'ngx-quill';

import { ChatPage } from './chat.page';
import { ChatListComponent } from './chat-list/chat-list.component';
import { ChatRoomComponent } from './chat-room/chat-room.component';
import { ChatPreviewComponent } from './chat-preview/chat-preview.component';
import { ChatRoutingModule } from './chat-routing.module';
import { ChatViewComponent } from './chat-view/chat-view.component';
import { ChatInfoComponent } from './chat-info/chat-info.component';
import { ComponentsModule } from '../../components/components.module';
import { PersonalisedHeaderModule } from '@v3/app/personalised-header/personalised-header.module';
import { AttachmentPopoverComponent } from './attachment-popover/attachment-popover.component';

Quill.register('modules/magicUrl', MagicUrl);

@NgModule({
  imports: [
    ComponentsModule,
    ChatRoutingModule,
    PersonalisedHeaderModule,
    QuillModule.forRoot({
      modules: {
        magicUrl: true,
      },
    })
  ],
  declarations: [
    ChatPage,
    ChatListComponent,
    ChatPreviewComponent,
    ChatRoomComponent,
    ChatViewComponent,
    ChatInfoComponent,
    AttachmentPopoverComponent
  ],
  providers: [],
  exports: [
    ChatRoomComponent,
  ]
})
export class ChatModule {}
