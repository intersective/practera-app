import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

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

  it('should set the input properties', () => {
    component.text = 'Click me';
    component.color = 'secondary';
    component.disabled = true;
    component.buttonType = 'submit';
    fixture.detectChanges();

    expect(component.text).toEqual('Click me');
    expect(component.color).toEqual('secondary');
    expect(component.disabled).toBeTruthy();
    expect(component.buttonType).toEqual('submit');
  });

  it('should emit event when handleClick is called', () => {
    spyOn(component.handleClick, 'emit');

    component.handleClick.emit();

    expect(component.handleClick.emit).toHaveBeenCalled();
  });
});
