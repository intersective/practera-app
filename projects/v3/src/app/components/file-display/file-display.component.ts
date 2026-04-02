import {
  Component,
  Input,
  Output,
  ViewChild,
  ElementRef,
  EventEmitter,
} from '@angular/core';
import { UtilsService } from '@v3/services/utils.service';
import { FileInput, TusFileResponse } from '../types/assessment';
import { FilePopupComponent } from '../file-popup/file-popup.component';
import { ModalController } from '@ionic/angular';

// backward-compatible file type that includes legacy property names
interface DisplayableFile extends TusFileResponse {
  filename: string;
  mimetype: string;
  url: string;
}

@Component({
  standalone: false,
  selector: 'app-file-display',
  templateUrl: 'file-display.component.html',
  styleUrls: ['file-display.component.scss'],
})
export class FileDisplayComponent {
  @Input() fileType: string = 'any';
  @Input() file?: DisplayableFile;
  @Input() isFileComponent: boolean = false; // flag parent component is FileComponent
  @ViewChild('videoEle') videoEle?: ElementRef = new ElementRef(null);
  @Output() removeFile: EventEmitter<any> = new EventEmitter<any>();
  @Input() disabled?: boolean;
  @Input() lines?: string = 'full';
  @Input() deletable?: boolean = true;

  constructor(
    private utils: UtilsService,
    private modalController: ModalController,
  ) { }

  async previewFile(file: FileInput, keyboardEvent?: KeyboardEvent) {
    if (
      keyboardEvent &&
      (keyboardEvent?.code === "Space" || keyboardEvent?.code === "Enter")
    ) {
      keyboardEvent.preventDefault();
    } else if (keyboardEvent) {
      return;
    }

    // open file in new tab
    if (this.file?.type?.includes('application')) {
      return window.open(file.url, '_system');
    }

    const modal = await this.modalController.create({
      component: FilePopupComponent,
      componentProps: {
        file,
      },
    });
    return await modal.present();
  }

  actionBtnClick(
    file: TusFileResponse,
    index: number
  ): void {
    switch (index) {
      case 0:
        // fallback for file URL (when value is loaded from API)
        const url = (file as TusFileResponse).directUrl || (file as FileInput).url;
        this.utils.downloadFile(url, file.name);
        return;
      case 1:
        this.removeUploadedFile(file);
        return;
    }
  }

  removeUploadedFile(file?: TusFileResponse): void {
    if (this.removeFile) {
      return this.removeFile.emit(file);
    }
  }

  get endingActionBtnIcons() {
    const icons: string[] = [
      'download',
    ];

    if (this.deletable === true && !this.disabled) {
      icons.push('trash');
    }
    return icons;
  }
}
