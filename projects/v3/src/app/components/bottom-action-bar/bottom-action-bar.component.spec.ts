import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
      expect(component.showLoadingOnClick).toBe(false);
      expect(component.loading).toBe(false);
    });
  });

  it('should set the input properties', () => {
    component.text = 'Click me';
    component.color = 'secondary';
    component.disabled$ = new BehaviorSubject<boolean>(false);
    component.disabled$.next(true);
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

    it('should show loading immediately and prevent duplicate clicks when opted in', () => {
      const disabled$ = new BehaviorSubject<boolean>(false);
      fixture.componentRef.setInput('disabled$', disabled$);
      fixture.componentRef.setInput('showLoadingOnClick', true);
      fixture.detectChanges();
      spyOn(component.handleClick, 'emit');

      const clickEvent = new MouseEvent('click');
      component.onClick(clickEvent);
      component.onClick(clickEvent);
      fixture.detectChanges();

      expect(component.loading).toBeTrue();
      expect(component.handleClick.emit).toHaveBeenCalledTimes(1);
      expect(fixture.debugElement.query(By.css('ion-spinner.action-spinner'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.button-container.is-loading'))).toBeTruthy();

      const actionButton = fixture.debugElement.query(By.css('ion-button.action-button'));
      expect(actionButton.properties.disabled).toBeTrue();
      expect(actionButton.attributes['aria-busy']).toBe('true');
    });

    it('should clear loading when disabled$ emits false after processing', () => {
      const disabled$ = new BehaviorSubject<boolean>(false);
      fixture.componentRef.setInput('disabled$', disabled$);
      fixture.componentRef.setInput('showLoadingOnClick', true);
      fixture.detectChanges();

      component.onClick(new MouseEvent('click'));
      disabled$.next(true);
      expect(component.loading).toBeTrue();

      disabled$.next(false);
      fixture.detectChanges();

      expect(component.loading).toBeFalse();
      expect(fixture.debugElement.query(By.css('ion-spinner.action-spinner'))).toBeNull();
    });

    it('should not enter loading or emit when already disabled', () => {
      fixture.componentRef.setInput('disabled$', new BehaviorSubject<boolean>(true));
      fixture.componentRef.setInput('showLoadingOnClick', true);
      fixture.detectChanges();
      spyOn(component.handleClick, 'emit');

      component.onClick(new MouseEvent('click'));
      fixture.detectChanges();

      expect(component.loading).toBeFalse();
      expect(component.handleClick.emit).not.toHaveBeenCalled();
      expect(fixture.debugElement.query(By.css('ion-spinner.action-spinner'))).toBeNull();

      const actionButton = fixture.debugElement.query(By.css('ion-button.action-button'));
      expect(actionButton.properties.disabled).toBeTrue();
      expect(actionButton.attributes['aria-busy']).toBe('false');
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
