import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MultiTeamMemberSelectorComponent } from './multi-team-member-selector.component';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { UtilsService } from '@v3/services/utils.service';
import { TestUtils } from '@testingv3/utils';

describe('MultiTeamMemberSelectorComponent', () => {
  let component: MultiTeamMemberSelectorComponent;
  let fixture: ComponentFixture<MultiTeamMemberSelectorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [MultiTeamMemberSelectorComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiTeamMemberSelectorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  describe('when testing onInit()', () => {
  });

});

