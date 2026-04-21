import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { PopoverController } from '@ionic/angular';
import { of } from 'rxjs';

import { AttachmentPopoverComponent } from './attachment-popover.component';
import { UppyUploaderService } from '@v3/app/components/uppy-uploader/uppy-uploader.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { ModalService } from '@v3/services/modal.service';

describe('AttachmentPopoverComponent', () => {
  let component: AttachmentPopoverComponent;
  let fixture: ComponentFixture<AttachmentPopoverComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AttachmentPopoverComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: PopoverController,
          useValue: jasmine.createSpyObj('PopoverController', ['dismiss', 'create'])
        },
        {
          provide: UppyUploaderService,
          useValue: jasmine.createSpyObj('UppyUploaderService', ['open'])
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', ['alert', 'presentToast'])
        },
        {
          provide: ModalService,
          useValue: jasmine.createSpyObj('ModalService', ['openUppyModal'])
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttachmentPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
