import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReviewsComponent } from './reviews.component';

describe('ReviewsComponent', () => {
  let component: ComponentFixture<ReviewsComponent>;
  beforeEach(() => {
    TestBed.configureTestingModule({
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      declarations: [ ReviewsComponent ]
    });

    component = TestBed.createComponent(ReviewsComponent);
  });

  it('should created', () => {
    expect(component).toBeTruthy();
  });
});
