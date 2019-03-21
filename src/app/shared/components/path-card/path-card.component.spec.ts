import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PathCardComponent } from './path-card.component';

describe('PathCardComponent', () => {
  let component: PathCardComponent;
  let fixture: ComponentFixture<PathCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PathCardComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PathCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
