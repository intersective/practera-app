import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UtilsService } from '@v3/services/utils.service';

export type FilePreviewMode = 'pdf' | 'image' | 'office' | 'download';

@Component({
  standalone: false,
  selector: 'app-file-preview',
  templateUrl: './file-preview.component.html',
  styleUrls: ['file-preview.component.scss']
})
export class FilePreviewComponent implements OnInit {
  url = '';
  file: { url?: string; name?: string; mimetype?: string; type?: string } = {};

  previewMode: FilePreviewMode = 'download';
  safePreviewUrl: SafeResourceUrl | null = null;

  constructor(
    public modalController: ModalController,
    public sanitizer: DomSanitizer,
    private utils: UtilsService,
  ) {}

  ngOnInit(): void {
    this.previewMode = this.resolvePreviewMode();
    if (this.previewMode === 'pdf' || this.previewMode === 'office') {
      const embedUrl = this.previewMode === 'office'
        ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(this.url)}`
        : this.url;
      this.safePreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    }
  }

  download() {
    const downloadUrl = this.file?.url || this.url;
    if (!downloadUrl) {
      return;
    }
    this.utils.downloadFile(downloadUrl, this.file?.name);
  }

  close() {
    this.modalController.dismiss();
  }

  private resolvePreviewMode(): FilePreviewMode {
    const mime = (this.file?.mimetype || this.file?.type || '').toLowerCase();
    const fileUrl = (this.url || '').toLowerCase();

    if (mime.startsWith('image/')) {
      return 'image';
    }

    if (mime === 'application/pdf' || fileUrl.endsWith('.pdf')) {
      return 'pdf';
    }

    if (
      mime.startsWith('application/vnd.openxmlformats-officedocument.')
      && this.useOfficeViewer(this.url)
    ) {
      return 'office';
    }

    return 'download';
  }

  private useOfficeViewer(fileUrl: string): boolean {
    if (!fileUrl?.startsWith('https://')) {
      return false;
    }
    try {
      const hostname = new URL(fileUrl).hostname;
      if (hostname === 'localhost' || hostname.endsWith('.local')) {
        return false;
      }
      if (fileUrl.includes('X-Amz-') || fileUrl.includes('x-amz-')) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }
}
