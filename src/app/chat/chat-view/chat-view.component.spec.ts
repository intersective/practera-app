import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, Directive } from '@angular/core';
import { Router } from '@angular/router';

import { ChatViewComponent } from './chat-view.component';
import { UtilsService } from '@services/utils.service';
import { MockRouter } from '@testing/mocked.service';

describe('ChatViewComponent', () => {
  let component: ChatViewComponent;
  let fixture: ComponentFixture<ChatViewComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let utils: UtilsService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatViewComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        UtilsService,
        {
          provide: Router,
          useClass: MockRouter
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatViewComponent);
    component = fixture.componentInstance;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    utils = TestBed.inject(UtilsService);
    component.chatList = { onEnter() {} };
    component.chatRoom = { onEnter() {} };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get correct activity id', fakeAsync(() => {
    spyOn(component.chatList, 'onEnter');
    component.onEnter();
    expect(component.teamMemberId).toBeNull();
    expect(component.participantsOnly).toBeNull();
    expect(component.teamId).toBeNull();
    expect(component.chatName).toBeNull();
    tick();
    expect(component.chatList.onEnter).toHaveBeenCalled();
  }));

  describe('when testing goToFirstTask()', () => {
    let chats;
    let expectedTeamId;
    let expectedTeamMemberId;
    let expectedParticipantsOnly;
    let expectedChatName;
    beforeEach(() => {
      // initialise the data
      component.teamId = null;
      component.teamMemberId = null;
      component.participantsOnly = null;
      component.chatName = null;
      chats = [{
        team_id: 1,
        team_member_id: 1,
        participants_only: false,
        name: ''
      }];
      expectedTeamId = null;
      expectedTeamMemberId = null;
      expectedParticipantsOnly = null;
      expectedChatName = null;
    });
    afterEach(() => {
      // do the test
      component.selectFirstChat(chats);
      expect(component.teamId).toEqual(expectedTeamId);
      expect(component.teamMemberId).toEqual(expectedTeamMemberId);
      expect(component.participantsOnly).toEqual(expectedParticipantsOnly);
      expect(component.chatName).toEqual(expectedChatName);
    });

    it('do nothing if team Id exist', () => {
      component.teamId = 1;
      expectedTeamId = 1;
    });

    it('should go to the first chat in chats', () => {
      chats = [
        {
          team_id: 10,
          participants_only: false,
          name: 'team 1'
        },
        {
          team_id: 10,
          team_member_id: 12,
          name: 'user'
        }
      ];
      expectedTeamId = 10;
      expectedTeamMemberId = null;
      expectedParticipantsOnly = false;
      expectedChatName = 'team 1';
    });
  });
  describe('when testing getCurrentChat()', () => {
    it('should return correct chat object', () => {
      component.teamId = 120;
      component.teamMemberId = 12;
      component.participantsOnly = null;
      component.chatName = 'abc';
      expect(component.getCurrentChat()).toEqual({
        teamId: 120,
        teamMemberId: 12,
        participantsOnly: null,
        chatName: 'abc'
      });
    });
  });
});
