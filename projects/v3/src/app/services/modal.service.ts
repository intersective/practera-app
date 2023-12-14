import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalQueue: any[] = [];
  private isShowingModal = false;

  constructor(private modalController: ModalController) { }

  async addModal(modalConfig: any, callback?: Function) {
    this.modalQueue.push({ modalConfig, callback });
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
      if (modalInfo.callback) {
        modalInfo.callback();
      }
      this.isShowingModal = false;
      this.showNextModal(); // Trigger next in line after closing the current one
    });

    return await modal.present();
  }
}
