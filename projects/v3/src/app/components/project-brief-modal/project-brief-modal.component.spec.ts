import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { ProjectBriefModalComponent, ProjectBrief } from './project-brief-modal.component';

describe('ProjectBriefModalComponent', () => {
  let component: ProjectBriefModalComponent;
  let fixture: ComponentFixture<ProjectBriefModalComponent>;
  let modalControllerSpy: jasmine.SpyObj<ModalController>;

  beforeEach(waitForAsync(() => {
    modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);

    TestBed.configureTestingModule({
      declarations: [ProjectBriefModalComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ModalController, useValue: modalControllerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectBriefModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('close()', () => {
    it('should dismiss the modal', () => {
      component.close();
      expect(modalControllerSpy.dismiss).toHaveBeenCalled();
    });
  });

  describe('hasItems()', () => {
    it('should return true for non-empty array', () => {
      expect(component.hasItems(['item1', 'item2'])).toBe(true);
    });

    it('should return false for empty array', () => {
      expect(component.hasItems([])).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(component.hasItems(undefined)).toBe(false);
    });

    it('should return false for null', () => {
      expect(component.hasItems(null as any)).toBe(false);
    });
  });

  describe('hasValue()', () => {
    it('should return true for non-empty string', () => {
      expect(component.hasValue('test value')).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(component.hasValue('')).toBe(false);
    });

    it('should return false for whitespace only string', () => {
      expect(component.hasValue('   ')).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(component.hasValue(undefined)).toBe(false);
    });

    it('should return false for null', () => {
      expect(component.hasValue(null as any)).toBe(false);
    });
  });

  describe('template rendering', () => {
    it('should display project brief title when provided', () => {
      const testBrief: ProjectBrief = {
        title: 'Test Project Title',
        description: 'Test description'
      };
      component.projectBrief = testBrief;
      fixture.detectChanges();

      const titleElement = fixture.nativeElement.querySelector('#project-brief-title');
      expect(titleElement.textContent).toContain('Test Project Title');
    });

    it('should display "none specified" for empty fields', () => {
      component.projectBrief = {};
      fixture.detectChanges();

      const noneSpecifiedElements = fixture.nativeElement.querySelectorAll('.none-specified');
      expect(noneSpecifiedElements.length).toBeGreaterThan(0);
    });

    it('should display industry chips when provided', () => {
      const testBrief: ProjectBrief = {
        industry: ['Health', 'Technology']
      };
      component.projectBrief = testBrief;
      fixture.detectChanges();

      const chips = fixture.nativeElement.querySelectorAll('ion-chip');
      expect(chips.length).toBe(2);
    });

    it('should display skills chips when provided', () => {
      const testBrief: ProjectBrief = {
        technicalSkills: ['Python', 'JavaScript'],
        professionalSkills: ['Leadership', 'Communication']
      };
      component.projectBrief = testBrief;
      fixture.detectChanges();

      const chips = fixture.nativeElement.querySelectorAll('ion-chip');
      expect(chips.length).toBe(4);
    });

    it('should use the primary brand color for section header icons', () => {
      const iconSelectors = [
        'ion-icon[name="document-text-outline"]',
        'ion-icon[name="business-outline"]',
        'ion-icon[name="code-slash-outline"]',
        'ion-icon[name="people-outline"]',
        'ion-icon[name="checkbox-outline"]'
      ];

      iconSelectors.forEach((selector) => {
        const icon: Element = fixture.nativeElement.querySelector(selector);
        expect(icon.getAttribute('color')).toBe('primary');
      });
    });

    it('should use the dark color for project brief chips', () => {
      component.projectBrief = {
        industry: ['Health'],
        technicalSkills: ['Python'],
        professionalSkills: ['Leadership']
      };
      fixture.detectChanges();

      const chips: NodeListOf<Element> = fixture.nativeElement.querySelectorAll('ion-chip');

      expect(chips.length).toBe(3);
      chips.forEach((chip) => {
        expect(chip.getAttribute('color')).toBe('dark');
      });
    });
  });
});
