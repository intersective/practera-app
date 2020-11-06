import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PreferenceService } from '@services/preference.service';
import { ActivatedRoute, Router } from '@angular/router';

import { PreferenceComponent } from './preference.component';

describe('PreferenceComponent', () => {
  let component: PreferenceComponent;
  let fixture: ComponentFixture<PreferenceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreferenceComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        {
          provide: PreferenceService,
          useValue: {
            getPreference: () => true
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            data: of(true)
          }
        },
        {
          provide: Router,
          useValue: {
            navigate: () => true
          }
        },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
