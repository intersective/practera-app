import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChatComponent } from './chat.component';
import { ChatRoomComponent } from './chat-room/chat-room.component';
import { ChatListComponent } from './chat-list/chat-list.component';
import { ChatResolverService } from './chat-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: ChatComponent,
    children: [
      {
        path: '',
        component: ChatListComponent,
      }
    ]
  },
  {
    path: 'chat-room/:teamId/:teamMemberId',
    component: ChatRoomComponent,
    resolve: [ChatResolverService],
  },
  {
    path: 'chat-room/team/:teamId/:participantsOnly',
    component: ChatRoomComponent,
    resolve: [ChatResolverService],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatRoutingModule {}
