import { CUSTOM_ELEMENTS_SCHEMA, Directive, SimpleChange } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SlidableComponent } from './slidable.component';
import { UtilsService } from '@services/utils.service';
import { Apollo } from 'apollo-angular';

describe('SlidableComponent', () => {
  let component: SlidableComponent;
  let fixture: ComponentFixture<SlidableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SlidableComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [ Apollo, UtilsService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlidableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('reorder()', () => {
    it('should reorder notification based on published_date from meta object', () => {

      const data = [
        {
          meta: {
            published_date: '2010-01-01',
          }
        },
        {
          meta: {
            published_date: '2010-01-02',
          }
        },
        {
          meta: {
            published_date: '2010-01-03',
          }
        },
        {
          meta: {
            published_date: '2010-01-04',
          }
        },
        {
          meta: {
            published_date: null,
          }
        },
      ];
      component.reorder(data);
    });
  });

  describe('ngOnChanges()', () => {
    it('should reorder notifications', () => {
      const dummy = [1, 2, 3, 4];
      spyOn(component, 'reorder').and.callFake(() => dummy);

      component.ngOnChanges({
        notifications: {
          firstChange: false,
          currentValue: '',
          isFirstChange: () => false,
          previousValue: '',
        }
      });
      expect(component.notifications).toEqual(dummy);
      expect(component.reorder).toHaveBeenCalled();
    });
  });

  describe('findAndNormaliseEvent()', () => {
    it('should reset format of events object', () => {
      const realEvents = [
        {
          name: 'event 1',
          startTime: '',
        },
        {
          name: 'event 2',
          startTime: '',
        },
      ];
      const eventItems = [
        { // should skip this
          type: 'anything else',
          name: 'should be skipped',
        },
        ...realEvents
      ];
      const result = component.findAndNormaliseEvent(eventItems);
      expect(result[1]).toEqual(jasmine.objectContaining({
        name: 'event 1',
        description: '',
        type: 'event',
        time: '',
      }));
    });
  });

  describe('navigate()', () => {
    it('should emit goto event', () => {
      spyOn(component.goto, 'emit');
      component.navigate('test');
      expect(component.goto.emit).toHaveBeenCalledWith('test');
    });
  });
});
