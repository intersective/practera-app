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
import { FilePreviewService } from '@v3/services/file-preview.service';
import { NotificationsService } from '@v3/services/notifications.service';

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
    private filePreviewService: FilePreviewService,
    private notifications: NotificationsService,
  ) { }

  private get mimeType(): string {
    return this.file?.type || this.file?.mimetype || '';
  }

  private get fileUrl(): string {
    return (this.file as TusFileResponse)?.directUrl || this.file?.url || '';
  }

  async openFilePreview(event?: Event): Promise<void> {
    if (event instanceof KeyboardEvent && event.code !== 'Space' && event.code !== 'Enter') {
      return;
    }
    event?.stopPropagation?.();

    const url = this.fileUrl;
    if (!url) {
      return;
    }

    const mime = this.mimeType;
    const previewable = this.isPreviewableMime(mime, url)
      || mime.startsWith('application/vnd.openxmlformats-officedocument.');

    if (previewable) {
      return this.filePreviewService.openModal(url, {
        url,
        name: this.file?.name,
        mimetype: mime,
        type: mime,
      });
    }

    this.utils.downloadFile(url, this.file?.name);
    return this.notifications.presentToast(
      $localize`File downloaded — open with your preferred app`,
      { color: 'success', duration: 3000 },
    );
  }

  onActionClick(event: Event, file: TusFileResponse, index: number): void {
    event.stopPropagation();
    event.preventDefault();
    this.actionBtnClick(file, index);
  }

  actionBtnClick(
    file: TusFileResponse,
    index: number
  ): void {
    switch (index) {
      case 0: {
        const url = (file as TusFileResponse).directUrl || (file as FileInput).url;
        this.utils.downloadFile(url, file.name);
        return;
      }
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

  private isPreviewableMime(mime: string, url: string): boolean {
    if (mime.startsWith('image/')) {
      return true;
    }
    if (mime === 'application/pdf' || url.toLowerCase().endsWith('.pdf')) {
      return true;
    }
    return false;
  }
}
