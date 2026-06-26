import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';

import { BottomActionBarComponent } from './bottom-action-bar.component';

describe('BottomActionBarComponent', () => {
  let component: BottomActionBarComponent;
  let fixture: ComponentFixture<BottomActionBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BottomActionBarComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BottomActionBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('default input values', () => {
    it('should have correct defaults', () => {
      expect(component.showResubmit).toBe(false);
      expect(component.color).toBe('primary');
      expect(component.buttonType).toBe('');
      expect(component.hasCustomContent).toBe(false);
      expect(component.disabled$).toBeUndefined();
    });
  });

  it('should set the input properties', () => {
    component.text = 'Click me';
    component.color = 'secondary';
    fixture.componentRef.setInput('disabled$', new BehaviorSubject<boolean>(true));
    component.buttonType = 'submit';
    fixture.detectChanges();

    expect(component.text).toEqual('Click me');
    expect(component.color).toEqual('secondary');
    expect(component.disabled$.value).toBeTruthy();
    expect(component.buttonType).toEqual('submit');
  });

  describe('onClick()', () => {
    it('should emit handleClick for a click event when not disabled', () => {
      component.disabled$ = new BehaviorSubject<boolean>(false);
      spyOn(component.handleClick, 'emit');

      const clickEvent = new MouseEvent('click');
      component.onClick(clickEvent);

      expect(component.handleClick.emit).toHaveBeenCalledWith(clickEvent);
    });

    it('should not emit handleClick when disabled$ is true', () => {
      component.disabled$ = new BehaviorSubject<boolean>(true);
      spyOn(component.handleClick, 'emit');

      const clickEvent = new MouseEvent('click');
      component.onClick(clickEvent);

      expect(component.handleClick.emit).not.toHaveBeenCalled();
    });

    it('should not emit handleClick for non-click event types', () => {
      component.disabled$ = new BehaviorSubject<boolean>(false);
      spyOn(component.handleClick, 'emit');

      const keyEvent = new KeyboardEvent('keydown');
      component.onClick(keyEvent);

      expect(component.handleClick.emit).not.toHaveBeenCalled();
    });

    it('should handle missing disabled$ (optional input)', () => {
      component.disabled$ = undefined;
      spyOn(component.handleClick, 'emit');

      const clickEvent = new MouseEvent('click');
      component.onClick(clickEvent);

      expect(component.handleClick.emit).toHaveBeenCalledWith(clickEvent);
    });
  });

  describe('onResubmit()', () => {
    it('should emit handleResubmit event', () => {
      spyOn(component.handleResubmit, 'emit');

      const clickEvent = new MouseEvent('click');
      component.onResubmit(clickEvent);

      expect(component.handleResubmit.emit).toHaveBeenCalledWith(clickEvent);
    });
  });

  it('should emit event when handleClick is called', () => {
    spyOn(component.handleClick, 'emit');

    component.handleClick.emit();

    expect(component.handleClick.emit).toHaveBeenCalled();
  });
});
