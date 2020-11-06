import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreferenceService } from '@services/preference.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { PreferenceUpdateComponent } from './preference-update.component';

describe('PreferenceUpdateComponent', () => {
  let component: PreferenceUpdateComponent;
  let fixture: ComponentFixture<PreferenceUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreferenceUpdateComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        {
          provide: PreferenceService,
          useValue: {
            'getPreference': () => true,
            'preference$': of(true),
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                key: 'testURLParam'
              }
            }
          }
        },
        {
          provide: Router,
          useValue: jasmine.createSpyObj('Router', {
            navigate: true
          })
        },
      ]
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
