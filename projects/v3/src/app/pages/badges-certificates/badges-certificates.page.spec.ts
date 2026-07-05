import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { of, throwError } from 'rxjs';

import { BadgesCertificatesPage } from './badges-certificates.page';
import { AchievementService, Achievement } from '@v3/app/services/achievement.service';
import { BadgeDetailModalComponent } from '@v3/app/components/badge-detail-modal/badge-detail-modal.component';
import { UtilsService } from '@v3/services/utils.service';

const BADGES: Achievement[] = [
  {
    id: 1,
    name: 'Alpha Badge',
    description: 'First badge',
    type: 'badge',
    badge: 'https://cdn/alpha.png',
    openBadge: 'https://cdn/openbadge1.png',
    points: 50,
    isEarned: true,
    earnedDate: '2024-01-01',
    progress: 1,
    active: true,
    certificateUrl: 'https://s3/alpha.pdf',
  },
  {
    id: 2,
    name: 'Beta Badge',
    description: 'Second badge',
    type: 'badge',
    badge: 'https://cdn/beta.png',
    openBadge: null,
    points: 30,
    isEarned: false,
    earnedDate: null,
    progress: 0.5,
    active: true,
    certificateUrl: null,
  },
  {
    id: 3,
    name: 'Super One',
    description: 'A super badge',
    type: 'superbadge',
    badge: 'https://cdn/super1.png',
    openBadge: 'https://cdn/superopen.png',
    points: 200,
    isEarned: true,
    earnedDate: '2024-06-01',
    progress: 1,
    active: true,
    certificateUrl: 'https://s3/super1.pdf',
  },
];

describe('BadgesCertificatesPage', () => {
  let component: BadgesCertificatesPage;
  let fixture: ComponentFixture<BadgesCertificatesPage>;
  let routerSpy: jasmine.SpyObj<Router>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let achievementSvcSpy: jasmine.SpyObj<AchievementService>;
  let utilsSpy: jasmine.SpyObj<UtilsService>;

  beforeEach(waitForAsync(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['create']);
    achievementSvcSpy = jasmine.createSpyObj('AchievementService', ['getBadges']);
    utilsSpy = jasmine.createSpyObj('UtilsService', ['setPageTitle', 'isMobile']);

    achievementSvcSpy.getBadges.and.returnValue(of(BADGES));

    TestBed.configureTestingModule({
      declarations: [BadgesCertificatesPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ModalController, useValue: modalCtrlSpy },
        { provide: AchievementService, useValue: achievementSvcSpy },
        { provide: UtilsService, useValue: utilsSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BadgesCertificatesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set page title on init', () => {
    expect(utilsSpy.setPageTitle).toHaveBeenCalledWith('Badges & Certificates - Practera');
  });

  it('should call getBadges on init', () => {
    expect(achievementSvcSpy.getBadges).toHaveBeenCalled();
  });

  it('should not be loading after badges arrive', () => {
    expect(component.loading).toBeFalse();
  });

  describe('tab filtering', () => {
    it('defaults to the "badge" tab', () => {
      expect(component.activeTab).toBe('badge');
    });

    it('shows only badges on the badge tab', () => {
      expect(component.filteredBadges.length).toBe(2);
      expect(component.filteredBadges.every(b => b.type === 'badge')).toBeTrue();
    });

    it('shows only superbadges when switching to superbadge tab', () => {
      component.switchTab({ detail: { value: 'superbadge' } });

      expect(component.activeTab).toBe('superbadge');
      expect(component.filteredBadges.length).toBe(1);
      expect(component.filteredBadges[0].type).toBe('superbadge');
    });

    it('resets to page 1 when switching tabs', () => {
      component.currentPage = 3;
      component.switchTab({ detail: { value: 'superbadge' } });

      expect(component.currentPage).toBe(1);
    });
  });

  describe('pagination', () => {
    it('displays up to PAGE_SIZE items initially', () => {
      // All three badges: 2 of type badge, defaults to badge tab
      expect(component.displayedBadges.length).toBe(2);
    });

    it('hasMore is false when all items are displayed', () => {
      expect(component.hasMore).toBeFalse();
    });

    it('hasMore is true when there are more items than displayed', () => {
      // Build 12 badges of type 'badge' to exceed page size of 10
      const manyBadges: Achievement[] = Array.from({ length: 12 }, (_, i) => ({
        ...BADGES[0],
        id: 100 + i,
        name: `Badge ${i}`,
      }));
      achievementSvcSpy.getBadges.and.returnValue(of(manyBadges));
      component.ngOnInit();
      // No detectChanges - of() is synchronous, state is already updated

      expect(component.hasMore).toBeTrue();
      expect(component.displayedBadges.length).toBe(10);
    });

    it('loadMore increases displayedBadges', () => {
      const manyBadges: Achievement[] = Array.from({ length: 12 }, (_, i) => ({
        ...BADGES[0],
        id: 200 + i,
        name: `Badge ${i}`,
      }));
      achievementSvcSpy.getBadges.and.returnValue(of(manyBadges));
      component.ngOnInit();
      // No detectChanges - of() is synchronous, state is already updated

      const before = component.displayedBadges.length;
      component.loadMore();

      expect(component.displayedBadges.length).toBeGreaterThan(before);
      expect(component.displayedBadges.length).toBe(12);
    });
  });

  describe('openBadgeDetail()', () => {
    it('ignores unsupported keyboard keys', async () => {
      await component.openBadgeDetail(BADGES[0], new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(modalCtrlSpy.create).not.toHaveBeenCalled();
    });

    it('creates and presents a BadgeDetailModalComponent for click events', async () => {
      const modalMock = { present: jasmine.createSpy('present').and.returnValue(Promise.resolve()) };
      modalCtrlSpy.create.and.returnValue(Promise.resolve(modalMock as any));

      await component.openBadgeDetail(BADGES[0]);

      expect(modalCtrlSpy.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          component: BadgeDetailModalComponent,
          componentProps: { achievement: BADGES[0] },
        })
      );
      expect(modalMock.present).toHaveBeenCalled();
    });

    it('creates modal on Enter key', async () => {
      const modalMock = { present: jasmine.createSpy('present').and.returnValue(Promise.resolve()) };
      modalCtrlSpy.create.and.returnValue(Promise.resolve(modalMock as any));

      await component.openBadgeDetail(BADGES[0], new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(modalCtrlSpy.create).toHaveBeenCalled();
    });

    it('creates modal on Space key', async () => {
      const modalMock = { present: jasmine.createSpy('present').and.returnValue(Promise.resolve()) };
      modalCtrlSpy.create.and.returnValue(Promise.resolve(modalMock as any));

      await component.openBadgeDetail(BADGES[0], new KeyboardEvent('keydown', { key: ' ' }));

      expect(modalCtrlSpy.create).toHaveBeenCalled();
    });
  });

  describe('goBack()', () => {
    it('navigates to settings', () => {
      component.goBack();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['v3', 'settings']);
    });
  });

  describe('error handling', () => {
    it('sets empty arrays and stops loading when getBadges errors', fakeAsync(() => {
      achievementSvcSpy.getBadges.and.returnValue(throwError(() => new Error('network error')));

      component.ngOnInit();
      tick();

      expect(component.loading).toBeFalse();
      expect(component.filteredBadges).toEqual([]);
      expect(component.displayedBadges).toEqual([]);
    }));
  });

  describe('ngOnDestroy()', () => {
    it('completes the unsubscribe subject', () => {
      const nextSpy = spyOn((component as any).unsubscribe$, 'next');
      const completeSpy = spyOn((component as any).unsubscribe$, 'complete');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });
});
