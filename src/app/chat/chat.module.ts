import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicStorageModule } from '@ionic/storage';
import { ChatComponent } from './chat.component';
import { ChatListComponent } from './chat-list/chat-list.component';
import { ChatRoomComponent } from './chat-room/chat-room.component';
import { ChatRoutingModule } from './chat-routing.module';
import { ChatService } from './chat.service';

@NgModule({
  imports: [
    IonicModule,
    IonicStorageModule.forRoot(),
    CommonModule,
    FormsModule,
    ChatRoutingModule,
  ],
  declarations: [
  	ChatComponent, 
  	ChatListComponent,
  	ChatRoomComponent
  ],
  providers:[ChatService]
})
export class ChatModule {}
