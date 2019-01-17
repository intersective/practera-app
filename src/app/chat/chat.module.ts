import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatComponent } from './chat.component';
import { ChatListComponent } from './chat-list/chat-list.component';
import { ChatRoomComponent } from './chat-room/chat-room.component';
import { ChatRoutingModule } from './chat-routing.module';
import { ChatService } from './chat.service';
import { LinkifyPipe } from '../shared/pipes/linkify/linkify.pipe';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ChatRoutingModule,
  ],
  declarations: [
    ChatComponent, 
    ChatListComponent,
    ChatRoomComponent,
    LinkifyPipe
  ],
  providers:[ChatService],
  exports: [ChatRoomComponent]
})
export class ChatModule {}
