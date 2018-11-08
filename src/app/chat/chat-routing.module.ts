import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChatComponent } from './chat.component';
import { ChatRoomComponent } from './chat-room/chat-room.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/chat/chat-room',
    pathMatch: 'full'
  },
  {
    path: 'chat-room',
    component: ChatRoomComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatRoutingModule {}
