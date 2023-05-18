import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { ListItemComponent } from './list-item.component';

describe('ListItemComponent', () => {
  let component: ListItemComponent;
  let fixture: ComponentFixture<ListItemComponent>;
  let ionItem: DebugElement;
  let element: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [ListItemComponent],
      imports: [IonicModule.forRoot()] // Add other necessary modules here
    }).compileComponents();

    fixture = TestBed.createComponent(ListItemComponent);
    component = fixture.debugElement.componentInstance;
    element = fixture.nativeElement.querySelector('.ion-item');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('statusDescriptions method should return correct value', () => {
    let result = component.statusDescriptions('lock-closed');
    expect(result).toEqual('locked');

    result = component.statusDescriptions('chevron-forward');
    expect(result).toEqual(null);

    result = component.statusDescriptions('checkmark-circle');
    expect(result).toEqual('completed');

    result = component.statusDescriptions('any other value');
    expect(result).toEqual(null);
  });
});
