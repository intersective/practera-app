import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ToggleLabelDirective } from './toggle-label.directive';

@Component({
  template: `
    <span
      [appToggleLabel]="toggleFunction"
      [toggleId]="'test-id'"
      [toggleDisabled]="disabled">
      Test Label
    </span>
  `,
  standalone: true,
  imports: [ToggleLabelDirective]
})
class TestComponent {
  disabled = false;
  toggleFunction = jasmine.createSpy('toggleFunction');
}

describe('ToggleLabelDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let spanElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    spanElement = fixture.debugElement.query(By.directive(ToggleLabelDirective));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(spanElement).toBeTruthy();
  });

  it('should call toggle function on click', () => {
    spanElement.triggerEventHandler('click', { preventDefault: () => {}, stopPropagation: () => {}, target: spanElement.nativeElement });
    expect(component.toggleFunction).toHaveBeenCalledWith('test-id');
  });

  it('should call toggle function on Enter key', () => {
    spanElement.triggerEventHandler('keydown', { key: 'Enter', preventDefault: () => {}, stopPropagation: () => {} });
    expect(component.toggleFunction).toHaveBeenCalledWith('test-id');
  });

  it('should call toggle function on Space key', () => {
    spanElement.triggerEventHandler('keydown', { key: ' ', preventDefault: () => {}, stopPropagation: () => {} });
    expect(component.toggleFunction).toHaveBeenCalledWith('test-id');
  });

  it('should not call toggle function when disabled', () => {
    const directive = spanElement.injector.get(ToggleLabelDirective);
    directive.toggleDisabled = true;

    spanElement.triggerEventHandler('click', { preventDefault: () => {}, stopPropagation: () => {}, target: spanElement.nativeElement });
    spanElement.triggerEventHandler('keydown', { key: 'Enter', preventDefault: () => {}, stopPropagation: () => {} });

    expect(component.toggleFunction).not.toHaveBeenCalled();
  });

  it('should not call toggle function when clicking on a link', () => {
    const mockEvent = {
      preventDefault: () => {},
      stopPropagation: () => {},
      target: {
        closest: (selector: string) => selector === 'a' ? {} : null
      }
    };

    spanElement.triggerEventHandler('click', mockEvent);
    expect(component.toggleFunction).not.toHaveBeenCalled();
  });
});
