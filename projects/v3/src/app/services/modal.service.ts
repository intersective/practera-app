import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';

// type for the source parameter, matching the original method signature
export type UppyModalSource = 'chat' | 'user-profile' | 'assessment' | 'media-manager' | 'static' | null;
@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalQueue: any[] = [];
  private isShowingModal = false;
  private activeModalIds: Set<string> = new Set();
  constructor(private modalController: ModalController) { }

  /**
   * Adds a modal to the queue to be displayed
   * @param modalConfig The configuration for the modal
   * @param callback Optional callback to execute after modal is dismissed
   * @param modalId Optional unique identifier to prevent duplicate modals
   * @returns Promise that resolves once the modal is added to queue
   */
  async addModal(modalConfig: any, callback?: Function, modalId?: string): Promise<void> {
    // check if the modalId already in queue or being shown
    if (modalId && this.activeModalIds.has(modalId)) {
      return;
    }

    if (modalId) {
      this.activeModalIds.add(modalId);
    }

    this.modalQueue.push({
      modalConfig,
      callback,
      modalId
    });

    this.showNextModal();
  }

  private async showNextModal() {
    if (this.isShowingModal || this.modalQueue.length === 0) {
      return;
    }

    const modalInfo = this.modalQueue.shift();
    const modal = await this.modalController.create(modalInfo.modalConfig);

    this.isShowingModal = true;

    modal.onDidDismiss().then(() => {
      if (modalInfo.modalId) {
        this.activeModalIds.delete(modalInfo.modalId);
      }

      if (modalInfo.callback) {
        modalInfo.callback();
      }
      this.isShowingModal = false;
      this.showNextModal(); // Trigger next in line after closing the current one
    });

    return await modal.present();
  }

  /**
   * opens a modal with the uppyuploadercomponent.
   * @param source the context or type of upload.
   * @return a promise that resolves with the modal element.
   */
  async openUppyUploaderModal(source: UppyModalSource): Promise<HTMLIonModalElement> {
    // Load the component lazily to avoid the runtime cycle:
    // NotificationsService -> ModalService -> UppyUploaderComponent -> NotificationsService.
    const { UppyUploaderComponent } = await import('../components/uppy-uploader/uppy-uploader.component');

    const modal = await this.modalController.create({
      component: UppyUploaderComponent,
      componentProps: {
        // 'source' will be passed to uppyuploadercomponent's @input() source.
        // there's an existing type mismatch between uppymodalsource and the component's expected source type.
        // using 'as any' to bypass this for now, as in the previous implementation.
        source: source as any
      },
      cssClass: 'uppy-uploader-modal',
    });
    await modal.present();
    return modal;
  }
}
