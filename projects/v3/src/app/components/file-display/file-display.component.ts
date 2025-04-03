import {
  Component,
  Input,
  Output,
  ViewChild,
  ElementRef,
  EventEmitter,
} from '@angular/core';
import { UtilsService } from '@v3/services/utils.service';
import { environment } from '@v3/environments/environment';
import { FileInput } from '../types/assessment';
import { FilePopupComponent } from '../file-popup/file-popup.component';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-file-display',
  templateUrl: 'file-display.component.html',
  styleUrls: ['file-display.component.scss'],
})
export class FileDisplayComponent {
  @Input() fileType: string = 'any';
  @Input() file?: FileInput;
  @Input() isFileComponent: boolean = false; // flag parent component is FileComponent
  @ViewChild('videoEle') videoEle?: ElementRef;
  @Output() removeFile: EventEmitter<any> = new EventEmitter();
  @Input() disabled?: boolean;
  @Input() lines?: string = 'full';

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
    file: FileInput,
    index: number
  ): void {
    if (this.fileType !== 'any') {
      return this.removeUploadedFile(file);
    }

    switch (index) {
      case 0:
        this.utils.downloadFile(file.url, file.name);
        return;
      case 1:
        this.removeUploadedFile(file);
        return;
    }
  }

  removeUploadedFile(file?: FileInput): void {
    return this.removeFile.emit(file);
  }

  get endingActionBtnIcons() {
    let icons: string[] = [];
    if (this.fileType === 'any') {
      icons = ['download'];
    }
    if (this.removeFile && !this.disabled) {
      icons.push('trash');
    }
    return icons;
  }
}
