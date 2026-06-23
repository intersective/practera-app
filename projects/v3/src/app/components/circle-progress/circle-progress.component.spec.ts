import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TestUtils } from '@testingv3/utils';
import { UtilsService } from '@v3/app/services/utils.service';
import { CircleProgressComponent } from './circle-progress.component';


describe('CircleProgressComponent', () => {
  let component: CircleProgressComponent;
  let fixture: ComponentFixture<CircleProgressComponent>;
  let utilsSpy: UtilsService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CircleProgressComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        {
          provide: UtilsService,
          useClass: TestUtils,
        }
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CircleProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    utilsSpy = TestBed.inject(UtilsService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit()', () => {
    it('should initiate config object', () => {
      component.data = {};
      component.ngOnInit();
      expect(component.config).toEqual({
        ...component.smallPlaceholderCircle,
        ...component.smallCircleWithData,
        ...component.data
      });
    });

    it('should initiate with large settings', () => {
      component.data = {};
      component.type = 'large';
      component.ngOnInit();

      expect(component.config).toEqual({
        ...component.largePlaceholderCircle,
        ...component.largeCircleWithData,
        ...component.data
      });
    });

    it('should initiate with large settings', () => {
      component.data = undefined;
      component.type = 'large';
      component.ngOnInit();

      expect(component.config).toEqual(component.largePlaceholderCircle);
    });

    it('should initiate with small settings', () => {
      component.data = undefined;
      component.type = 'small';
      component.ngOnInit();

      expect(component.config).toEqual(component.smallPlaceholderCircle);
    });
  });

  describe('ngOnChanges()', () => {
    it('should update config according to new data', () => {
      const DUMMY_CIRCLE = {
        dummy: 'circle'
      };

      component.ngOnChanges({
        data: {
          currentValue: DUMMY_CIRCLE,
        }
      } as any);

      expect(component.config).toEqual({
        ...component.smallPlaceholderCircle,
        ...component.smallCircleWithData,
        ...DUMMY_CIRCLE,
      });
    });
  });

  describe('isMobile()', () => {
    it('should return utils.isMobile value', () => {
      utilsSpy.isMobile = jasmine.createSpy('isMobile').and.returnValue(true);
      expect(component.isMobile).toEqual(true);

      utilsSpy.isMobile = jasmine.createSpy('isMobile').and.returnValue(false);
      expect(component.isMobile).toEqual(false);
    });
  });
});
