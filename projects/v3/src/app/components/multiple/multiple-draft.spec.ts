import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { MultipleComponent } from './multiple.component';
import { LanguageDetectionPipe } from '@v3/app/pipes/language.pipe';
import { ToggleLabelDirective } from '@v3/app/directives/toggle-label/toggle-label.directive';
import { UtilsService } from '@v3/services/utils.service';

describe('MultipleComponent draft journey', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToggleLabelDirective],
      declarations: [MultipleComponent, LanguageDetectionPipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{ provide: UtilsService, useValue: {
        // Keep the real array semantics: the legacy TestUtils tolerates undefined.
        indexOf: UtilsService.prototype.indexOf,
        addLanguageAttributes: (content: string) => content,
      } }],
    }).compileComponents();
  });

  it('renders every choice when the learner has no saved answer', () => {
    const fixture = TestBed.createComponent(MultipleComponent);
    const component = fixture.componentInstance;
    component.question = { id: 3, name: 'Skills', choices: [
      { id: 21, name: 'Research' }, { id: 22, name: 'Design' },
    ] };
    component.control = new FormControl(null);
    component.doAssessment = true;
    component.submissionStatus = 'in progress';
    component.submission = { answer: undefined };
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(Array.from(fixture.nativeElement.querySelectorAll('ion-checkbox'))
      .map((element: Element) => element.getAttribute('aria-label'))).toEqual(['Research', 'Design']);
    fixture.destroy();
  });

  it('restores dirty form answers when pagination recreates the input', () => {
    const fixture = TestBed.createComponent(MultipleComponent);
    const component = fixture.componentInstance;
    component.control = new FormControl([22]);
    component.control.markAsDirty();
    component.submission = { answer: [21] };
    component.submissionStatus = 'in progress';
    component.doAssessment = true;
    component.ngOnInit();
    expect(component.innerValue).toEqual([22]);
    fixture.destroy();
  });
});
