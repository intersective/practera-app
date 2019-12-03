import { CUSTOM_ELEMENTS_SCHEMA, Directive } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SlidableComponent } from './slidable.component';

describe('SlidableComponent', () => {
  let component: SlidableComponent;
  let fixture: ComponentFixture<SlidableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SlidableComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlidableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
