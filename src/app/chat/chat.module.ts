import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatListComponent } from './chat-list/chat-list.component';
import { ChatRoomComponent } from './chat-room/chat-room.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: ChatListComponent }])
  ],
  declarations: [ChatListComponent, ChatRoomComponent]
})
export class ChatModule {}
