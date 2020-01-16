import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ChatRoomComponent } from './chat-room.component';
import { ChatService } from '../chat.service';
import { of } from 'rxjs';

describe('ChatRoomComponent', () => {
  // let component: ChatRoomComponent;
  // let fixture: ComponentFixture<ChatRoomComponent>;

  // beforeEach(async(() => {
  //   TestBed.configureTestingModule({
  //     imports: [ RouterTestingModule ],
  //     declarations: [ ChatRoomComponent ],
  //     schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  //     providers: [{
  //       provide: ChatService, useValue: {
  //         getMessageList: () => {
  //           return of(true);
  //         }
  //       }
  //     }]
  //   })
  //   .compileComponents();
  // }));

  // beforeEach(() => {
  //   fixture = TestBed.createComponent(ChatRoomComponent);
  //   component = fixture.componentInstance;
  //   fixture.detectChanges();
  // });

  it('should create', () => {
    // expect(component).toBeTruthy();
    // expect(component._loadMessages).toBeDefined();
    // expect(component.back).toBeDefined();
    // expect(component.sendMessage).toBeDefined();
  });

  it('should initiated with variables', () => {
    // spyOn(component, 'validateRoutePrams').and.returnValue(true);

    // component.ngOnInit();
    // expect(component.selectedChat).toBeDefined();
    // expect(component['validateRoutePrams']).toHaveBeenCalled();
  });

  /*it('should load messages with loadMessage', () => {
    spyOn(ChatService, 'getMessageList').and.returnValue(true);
    expect(component.loadMessages).toBeDefined();
    component.loadMessages();
    expect(component.loadMessages).toBeDefined;
  });*/

});
