import { Injectable } from '@angular/core';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UppyUploaderService } from '@v3/app/components/uppy-uploader/uppy-uploader.service';

@Injectable({
  providedIn: 'root',
})
export class SinglePageDeactivateGuard {
  constructor(
    readonly storage: BrowserStorageService,
    private uppyUploaderService: UppyUploaderService,
  ) {}

  async canDeactivate(): Promise<boolean> {
    if (this.storage.singlePageAccess === true) {
      return false;
    }

    if (this.uppyUploaderService.compressingUppy !== null) {
      const leave = window.confirm(
        'Video is still compressing. If you leave, the file will not be uploaded. Continue?'
      );
      if (leave) {
        this.uppyUploaderService.cancelCompression();
      }
      return leave;
    }

    return true;
  }
}
