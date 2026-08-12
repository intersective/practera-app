import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  standalone: false,
  selector: 'app-chat-preview',
  templateUrl: 'chat-preview.component.html',
  styleUrls: ['chat-preview.component.scss']
})
export class ChatPreviewComponent {
  @Input() file: any = {};

  constructor(
    public modalController: ModalController,
    public sanitizer: DomSanitizer
  ) {}

  get previewUrl(): string {
    return this.file?.preview || this.file?.url;
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

  /**
   * @description checks if the video format is natively supported by the browser
   */
  isBrowserSupportedVideo(): boolean {
    const supportedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    return !!(this.file?.type && supportedTypes.includes(this.file.type));
  }

  /**
   * @description handles video playback errors
   */
  handleVideoError(videoError: Event): void {
    console.error('Video Error::', videoError);
    const target = videoError.target as HTMLVideoElement;
    if (target) {
      console.error('Video error details:', {
        code: target.error?.code,
        message: target.error?.message,
        src: target.src,
        networkState: target.networkState,
        readyState: target.readyState,
      });
    }
  }
}
