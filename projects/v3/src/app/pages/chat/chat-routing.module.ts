import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChatPage } from './chat.page';
import { ChatViewComponent } from './chat-view/chat-view.component';
import { ChatRoomComponent } from './chat-room/chat-room.component';

const routes: Routes = [
  {
    path: '',
    component: ChatPage,
    children: [
      {
        path: '',
        component: ChatViewComponent,
      }
    ]
  },
  {
    path: 'chat-room',
    component: ChatRoomComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatRoutingModule {}
