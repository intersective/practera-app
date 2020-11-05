import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreferenceUpdateComponent } from './preference-update.component';

describe('PreferenceUpdateComponent', () => {
  let component: PreferenceUpdateComponent;
  let fixture: ComponentFixture<PreferenceUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreferenceUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreferenceUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
