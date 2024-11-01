import { NgModule } from '@angular/core';

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

import 'quill-paste-smart';
import Delta from 'quill-delta';

@NgModule({
  imports: [
    ComponentsModule,
    ChatRoutingModule,
    PersonalisedHeaderModule,
    QuillModule.forRoot({
      debug: "log",
      modules: {
        toolbar: true,
        pasteSmart: {},
        clipboard: {
          matchers: [
            (
              Node.ELEMENT_NODE,
              (node: any, delta: any) => {
                const plaintext = node.innerText;
                return new Delta().insert(plaintext);
              }
            )
          ],
        },
      },
      placeholder: "Compose an epic...",
    }),
  ],
  declarations: [
    ChatPage,
    ChatListComponent,
    ChatPreviewComponent,
    ChatRoomComponent,
    ChatViewComponent,
    ChatInfoComponent,
    AttachmentPopoverComponent,
  ],
  entryComponents: [
    ChatPreviewComponent,
    ChatInfoComponent,
    AttachmentPopoverComponent,
  ],
  providers: [],
  exports: [ChatRoomComponent],
})
export class ChatModule {}
