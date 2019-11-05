import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FileDisplayComponent } from './file-display.component';
import { FilestackService } from '@shared/filestack/filestack.service';
import { Observable, of, pipe } from 'rxjs';
import { SharedModule } from '@shared/shared.module';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

describe('FileDisplayComponent', () => {
  let component: FileDisplayComponent;
  let fixture: ComponentFixture<FileDisplayComponent>;
  let filestackSpy: jasmine.SpyObj<FilestackService>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ SharedModule, ReactiveFormsModule ],
      declarations: [ FileDisplayComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        {
          provide: FilestackService,
          useValue: jasmine.createSpyObj('FilestackService', ['previewFile'])
        },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileDisplayComponent);
    component = fixture.componentInstance;
    filestackSpy = TestBed.get(FilestackService);
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should preview file', () => {
    component.previewFile('file');
    expect(filestackSpy.previewFile.calls.count()).toBe(1);
  });

});

