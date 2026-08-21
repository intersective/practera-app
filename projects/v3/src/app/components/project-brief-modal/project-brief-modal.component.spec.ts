import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { ProjectBriefModalComponent } from './project-brief-modal.component';
import { ProjectBrief } from '../../models/project-brief.model';
import { ProjectBriefMarkdownPipe } from '../../pipes/project-brief-markdown.pipe';
import { NotificationsService } from '../../services/notifications.service';
import { ProjectBriefPdfService } from '../../services/project-brief-pdf.service';

describe('ProjectBriefModalComponent', () => {
  let component: ProjectBriefModalComponent;
  let fixture: ComponentFixture<ProjectBriefModalComponent>;
  let modalControllerSpy: jasmine.SpyObj<ModalController>;
  let notificationsSpy: jasmine.SpyObj<NotificationsService>;
  let projectBriefPdfServiceSpy: jasmine.SpyObj<ProjectBriefPdfService>;

  beforeEach(waitForAsync(() => {
    modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    notificationsSpy = jasmine.createSpyObj('NotificationsService', ['presentToast']);
    projectBriefPdfServiceSpy = jasmine.createSpyObj('ProjectBriefPdfService', ['download']);
    projectBriefPdfServiceSpy.download.and.resolveTo();

    TestBed.configureTestingModule({
      declarations: [ProjectBriefModalComponent, ProjectBriefMarkdownPipe],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: NotificationsService, useValue: notificationsSpy },
        { provide: ProjectBriefPdfService, useValue: projectBriefPdfServiceSpy },
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

  describe('downloadPdf()', () => {
    it('shows loading, ignores duplicate selections, and restores the button after success without closing', async () => {
      let resolveDownload: () => void = () => undefined;
      projectBriefPdfServiceSpy.download.and.returnValue(new Promise<void>(resolve => {
        resolveDownload = resolve;
      }));
      component.allowPdfDownload = true;
      component.projectBrief = { title: 'Download me' };
      fixture.detectChanges();

      const firstDownload = component.downloadPdf();
      component.downloadPdf();
      fixture.detectChanges();

      expect(component.isDownloading).toBe(true);
      expect(projectBriefPdfServiceSpy.download).toHaveBeenCalledTimes(1);
      expect(fixture.nativeElement.querySelector('.project-brief-download-button').disabled).toBe(true);

      resolveDownload();
      await firstDownload;
      fixture.detectChanges();

      expect(component.isDownloading).toBe(false);
      expect(modalControllerSpy.dismiss).not.toHaveBeenCalled();
    });

    it('keeps the modal open, restores the button, and shows a localized danger toast when export fails', async () => {
      projectBriefPdfServiceSpy.download.and.rejectWith(new Error('PDF unavailable'));
      component.allowPdfDownload = true;
      component.projectBrief = { title: 'Download me' };

      await component.downloadPdf();

      expect(component.isDownloading).toBe(false);
      expect(notificationsSpy.presentToast).toHaveBeenCalledWith(jasmine.any(String), {
        color: 'danger',
        icon: 'close-circle',
      });
      expect(modalControllerSpy.dismiss).not.toHaveBeenCalled();
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
    it('renders the full ordered version 2 brief with organisation details and learner download shell', () => {
      const testBrief: ProjectBrief = {
        title: 'Test Project Title',
        description: 'Project **overview**',
        organisationName: 'Example organisation',
        organisationType: 'Social enterprise',
        organisationContext: 'Regional context',
        problemStatement: 'A clear problem',
        focusArea: 'A clear focus',
        scope: 'Defined scope',
        deliverables: 'A delivery roadmap',
        industry: ['Health'],
        projectType: 'Research',
        timeline: 12,
        location: 'Kuala Lumpur',
        website: 'https://example.com/project',
        technicalSkills: ['TypeScript'],
        professionalSkills: ['Communication'],
      };
      component.projectBrief = testBrief;
      component.allowPdfDownload = true;
      fixture.detectChanges();

      const titleElement = fixture.nativeElement.querySelector('#project-brief-title');
      expect(titleElement.textContent).toContain('Test Project Title');
      expect(fixture.nativeElement.textContent).toContain('Example organisation');
      expect(fixture.nativeElement.textContent).toContain('Social enterprise');
      expect(Array.from(fixture.nativeElement.querySelectorAll('.accordion-header'))
        .map((element: Element) => element.textContent?.trim())).toEqual([
        'Project Overview',
        'Scope of Work',
        'Organisational Context',
        'Problem Statement',
        'Focus Area',
        'Project Outcomes',
        'Industry',
        'Project Type',
        'Duration',
        'Location',
        'Website',
        'Technical Skills',
        'Professional Skills',
      ]);
      expect(fixture.nativeElement.querySelector('a[href="https://example.com/project"]')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.project-brief-download-button')).toBeTruthy();
    });

    it('should display "none specified" for empty fields', () => {
      component.projectBrief = {};
      fixture.detectChanges();

      const noneSpecifiedElements = fixture.nativeElement.querySelectorAll('.none-specified');
      expect(noneSpecifiedElements.length).toBe(13);
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

    it('renders duplicate chip labels without dropping learner data', () => {
      const warnSpy = spyOn(console, 'warn').and.callThrough();
      component.projectBrief = {
        industry: ['Health', 'Health'],
      };
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('ion-chip').length).toBe(2);
      expect(warnSpy).not.toHaveBeenCalledWith(jasmine.stringMatching('NG0955'));
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

    it('should use the primary brand color for section accents', () => {
      component.projectBrief = {
        industry: ['Health'],
        technicalSkills: ['Python'],
        professionalSkills: ['Leadership'],
        deliverables: 'Prototype'
      };
      fixture.detectChanges();

      const accentSelectors = [
        'ion-icon[name="document-text-outline"]',
        'ion-icon[name="business-outline"]',
        'ion-icon[name="code-slash-outline"]',
        'ion-icon[name="people-outline"]',
        'ion-icon[name="checkbox-outline"]'
      ];

      accentSelectors.forEach((selector) => {
        fixture.nativeElement.querySelectorAll(selector).forEach((element: Element) => {
          expect(element.getAttribute('color')).toBe('primary');
        });
      });

      fixture.nativeElement.querySelectorAll('ion-chip').forEach((element: Element) => {
        expect(element.getAttribute('color')).toBe('primary');
        expect(element.getAttribute('outline')).toBe('true');
      });
    });
  });
});
