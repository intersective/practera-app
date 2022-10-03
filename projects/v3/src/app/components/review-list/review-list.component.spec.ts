import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ReviewListComponent } from './review-list.component';

describe('ReviewListComponent', () => {
  let component: ReviewListComponent;
  let fixture: ComponentFixture<ReviewListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewListComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit()', () => {
    it('should showDone = false', () => {
      component.ngOnInit();
      expect(component.showDone).toEqual(false);
    });
  });

  describe('goto()', () => {
    it('should navigate to a review', () => {
      const spy = spyOn(component.navigate, 'emit');
      component.goto({} as any);
      expect(spy).toHaveBeenCalled();
    });

    it('should navigate to a review with keyboardEvent', () => {
      const kbEvent = new KeyboardEvent('keydown', {
        code: 'Enter',
        key: 'Enter',
      });
      const spy = spyOn(component.navigate, 'emit');
      const spyKbEvent = spyOn(kbEvent, 'preventDefault');
      component.goto({} as any, kbEvent);

      expect(spy).toHaveBeenCalled();
      expect(spyKbEvent).toHaveBeenCalled();
    });
  });

  describe('switchStatus()', () => {
    it('should switch status', () => {
      component.reviews = [{
        isDone: true,
      } as any];
      component.showDone = false;
      component.goToFirstOnSwitch = true;
      const spy = spyOn(component.navigate, 'emit');
      component.switchStatus();
      expect(spy).toHaveBeenCalled();
      expect(component.showDone).toBeTrue();
    });
  });

  describe('noReviews()', () => {
    it('should be null', () => {
      component.reviews = null;
      expect(component.noReviews).toEqual('');

      component.showDone = true;
      component.reviews = [{
        isDone: true,
      } as any];
      expect(component.noReviews).toEqual('');
    });

    it('should return "completed"', () => {
      component.reviews = [
        { isDone: false } as any
      ];
      component.showDone = true;
      expect(component.noReviews).toEqual('completed');
    });

    it('should return "pending"', () => {
      component.reviews = [
        { isDone: true } as any
      ];
      component.showDone = false;
      expect(component.noReviews).toEqual('pending');
    });
  });
});
