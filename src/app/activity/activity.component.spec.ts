import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilsService } from '@services/utils.service';
import { ActivityComponent } from './activity.component';
import { Observable, of, pipe } from 'rxjs';
// import { ActivatedRouteStub } from '../../testing/activated-route-stub';
import { ActivatedRoute } from '@angular/router';

describe('ActivityComponent', () => {
  let component: ActivityComponent;
  let fixture: ComponentFixture<ActivityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        {
          provide: UtilsService, useValue: {
            isEmpty: (data) => data
          }
        },
        {
        provide: ActivatedRoute, useValue: {
            params: of({id: 123}),
            snapshot: {
              paramMap: {
                get: (id) => id,
              }
            }
          }
        },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });
});
