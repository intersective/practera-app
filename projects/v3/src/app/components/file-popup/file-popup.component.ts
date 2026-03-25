import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  standalone: false,
  selector: 'app-file-popup',
  templateUrl: 'file-popup.component.html',
  styleUrls: ['file-popup.component.scss']
})
export class FilePopupComponent {
  @Input() file: any = {};

  constructor(
    public modalController: ModalController,
    public sanitizer: DomSanitizer
  ) {}

  /**
   * @description checks if video format is natively supported by browsers.
   * only mp4, webm, and ogg are widely supported.
   */
  isBrowserSupportedVideo(): boolean {
    if (!this.file?.type || !this.file.type.includes('video')) {
      return false;
    }
    const supportedFormats = ['video/mp4', 'video/webm', 'video/ogg'];
    return supportedFormats.some(format => this.file.type.includes(format));
  }

  download(keyboardEvent?: KeyboardEvent) {
    if (keyboardEvent && (keyboardEvent?.code === 'Space' || keyboardEvent?.code === 'Enter')) {
      keyboardEvent.preventDefault();
    } else if (keyboardEvent) {
      return;
    }

    return window.open(this.file.url, '_system');
  }

  close(keyboardEvent?: KeyboardEvent) {
    if (keyboardEvent && (keyboardEvent?.code === 'Space' || keyboardEvent?.code === 'Enter')) {
      keyboardEvent.preventDefault();
    } else if (keyboardEvent) {
      return;
    }

    this.modalController.dismiss();
  }

  handleVideoError(videoError: Event): void {
    console.error('Video playback error:', videoError);
    const target = videoError.target as HTMLVideoElement;
    if (target?.error) {
      const errorCode = target.error.code;
      const errorMessage = target.error.message;
      console.error('Video error details:', {
        code: errorCode,
        message: errorMessage,
        src: target.src,
        networkState: target.networkState,
        readyState: target.readyState
      });
    }
  }
}
