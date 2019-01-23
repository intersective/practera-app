import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChatComponent } from './chat.component';
import { ChatRoomComponent } from './chat-room/chat-room.component';
import { ChatListComponent } from './chat-list/chat-list.component';

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
  },
  {
    path: 'chat-room/:teamId',
    component: ChatRoomComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatRoutingModule {}