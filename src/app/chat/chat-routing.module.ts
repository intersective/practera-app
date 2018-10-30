import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChatListComponent } from './chat-list/chat-list.component';
import { ChatRoomComponent } from './chat-room/chat-room.component';

const routes: Routes = [
  {
    path: '',
    component: ChatListComponent
  },
  {
    path: 'chatroom',
    component: ChatRoomComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatRoutingModule {}
