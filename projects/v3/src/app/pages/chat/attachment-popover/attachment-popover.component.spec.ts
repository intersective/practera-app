import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { PopoverController } from '@ionic/angular/lazy';
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
  for (const [type, allowedTypes] of [
    ['any', undefined],
    ['image', ['image/*']],
    ['video', ['video/*']],
  ] as const) {
    it(`uploads ${type} attachments under chat while keeping the picker restriction separate`, async () => {
      const uploader = TestBed.inject(UppyUploaderService) as jasmine.SpyObj<UppyUploaderService>;
      const selected = { name: 'attachment.png', url: 'https://files.example.test/image' };
      uploader.open.and.returnValue(Promise.resolve({
        onDidDismiss: () => Promise.resolve({ data: selected }),
      } as any));
      const popover = jasmine.createSpyObj('PopoverController', ['dismiss']);
      (component as any).popoverController = popover;

      await component.openAttachPopup(type);
      await Promise.resolve();

      expect(uploader.open.calls.mostRecent().args).toEqual(['chat', allowedTypes] as any);
      expect(popover.dismiss).toHaveBeenCalledWith({ selectedFile: selected });
    });
  }

});
