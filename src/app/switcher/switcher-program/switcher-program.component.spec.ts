import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { SwitcherProgramComponent } from './switcher-program.component';
import { SwitcherService } from '../switcher.service';
import { MockSwitcherService } from '@testing/mocked.service';
import { ProgramFixture } from '@testing/fixtures/programs';

describe('SwitcherProgramComponent', () => {
  let component: SwitcherProgramComponent;
  let fixture: ComponentFixture<SwitcherProgramComponent>;
  let newrelicSpy: jasmine.SpyObj<NewRelicService>;
  let swicherSpy: jasmine.SpyObj<SwitcherService>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SwitcherProgramComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        NewRelicService,
        {
          provide: SwitcherService,
          useClass: MockSwitcherService,
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SwitcherProgramComponent);
    component = fixture.componentInstance;
    newrelicSpy = TestBed.get(NewRelicService);
    swicherSpy = TestBed.get(SwitcherService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SwitcherProgramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit()', () => {
    it('should instantiate with API program list', () => {
      component.ngOnInit();
      expect(newrelicSpy.setPageViewName).toHaveBeenCalled();
      expect(swicherSpy.getPrograms().subscribe).toHaveBeenCalled();
      expect(component.programs).toEqual(ProgramFixture);
    });
  });

  describe('switch()', () => {
    it('should switch to selected program based on provided programmatic index', () => {

    });
  });
});
