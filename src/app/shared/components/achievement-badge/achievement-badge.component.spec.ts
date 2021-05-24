import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';

import { AchievementBadgeComponent } from './achievement-badge.component';
import { NotificationService } from '@shared/notification/notification.service';
import { UtilsService } from '@services/utils.service';



describe('AchievementBadgeComponent', () => {
  let component: AchievementBadgeComponent;
  let fixture: ComponentFixture<AchievementBadgeComponent>;
  let documentSpy: Document;
  let notificationSpy: jasmine.SpyObj<NotificationService>

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [ AchievementBadgeComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        {
          provide: UtilsService,
          useValue: jasmine.createSpyObj('UtilsService', ['isMobile']),
        },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', ['achievementPopUp'])
        },
        Document,
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AchievementBadgeComponent);
    component = fixture.componentInstance;
    if (!component.achievement) {
      component.achievement = {
        id: 123,
        name: 'test-name',
        description: 'test description'
      };
    }
    component.achievement.image = 'test';

    fixture.detectChanges();

    documentSpy = TestBed.inject(Document) as jasmine.SpyObj<Document>;
    notificationSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('currentActiveElement()', () => {
    it('should return currentActiveElement', () => {
      const result = component.currentActiveElement();

      expect(typeof documentSpy.activeElement).toEqual(typeof result);
    });
  });

  describe('showAchievementDetails()', () => {
    it('should popup achievement notification', () => {
      component.showAchievementDetails();

      expect(notificationSpy.achievementPopUp).toHaveBeenCalled();
    });
  });
});
