import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SlidableComponent } from './slidable.component';

describe('SlidableComponent', () => {
  let component: SlidableComponent;
  let fixture: ComponentFixture<SlidableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SlidableComponent ]
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
