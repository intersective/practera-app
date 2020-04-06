import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChatComponent } from './chat.component';
import { ChatViewComponent } from './chat-view/chat-view.component';
import { ChatRoomComponent } from './chat-room/chat-room.component';

const routes: Routes = [
  {
    path: '',
    component: ChatComponent,
    children: [
      {
        path: '',
        component: ChatViewComponent,
      }
    ]
  },
  {
    path: 'chat-room/:teamId/:teamMemberId',
    component: ChatRoomComponent,
  },
  {
    path: 'chat-room/team/:teamId/:participantsOnly',
    component: ChatRoomComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatRoutingModule {}
