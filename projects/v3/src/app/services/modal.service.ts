import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';

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
    // If modalId is provided, check if already in queue or being shown
    if (modalId && this.activeModalIds.has(modalId)) {
      console.log(`Modal with ID ${modalId} already in queue or being shown, skipping`);
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
}
