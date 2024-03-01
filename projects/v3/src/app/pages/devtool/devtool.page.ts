import { Component, OnInit } from '@angular/core';
import { AuthService } from '@v3/app/services/auth.service';
import { ExperienceService } from '@v3/app/services/experience.service';
import { FastFeedbackService } from '@v3/app/services/fast-feedback.service';
import { NotificationsService } from '@v3/app/services/notifications.service';
import { BrowserStorageService } from '@v3/app/services/storage.service';
import { SharedService } from '@v3/app/services/shared.service';
import { UnlockIndicatorService } from '@v3/app/services/unlock-indicator.service';

@Component({
  selector: 'app-devtool',
  templateUrl: './devtool.page.html',
  styleUrls: ['./devtool.page.scss'],
})
export class DevtoolPage implements OnInit {
  doneLogin: boolean = false;
  user: any = {};
  identifier: string;

  sample: any;

  constructor(
    private authService: AuthService,
    private storageService: BrowserStorageService,
    private fastFeedbackService: FastFeedbackService,
    private notificationsService: NotificationsService,
    private experienceService: ExperienceService,
    private sharedService: SharedService,
    private unlockIndicatorService: UnlockIndicatorService
      ) { }

  ngOnInit() {
    this.doneLogin = this.authService.isAuthenticated();
    if (this.doneLogin) {
      this.user = this.storageService.get('me');
    }
  }

  refresh() {
    this.sharedService.getNewJwt().subscribe();
  }

  login() {
    /* this.authService.authenticate({
      email: 'learner_008@practera.com',
      password: 'REDACTED_TEST_PASSWORD'
    }).subscribe(res => {
      this.doneLogin = true;
      this.user = res;
      this.experienceService.getMyInfo();
    }); */
  }

  async pulsecheck() {
    this.storageService.set('fastFeedbackOpening', false);
    const modal = await this.fastFeedbackService.pullFastFeedback({ modalOnly: true }).toPromise();
    if (modal && modal.present) {
      await modal.present();
      await modal.onDidDismiss();
    }
  }

  async reviewrating() {
    this.notificationsService.popUpReviewRating(1, false);
  }

  async testAuth(withAPIkey?: boolean) {
    let data: any = {};
    if (withAPIkey === true) {
      data.apikey = this.storageService.getUser().apikey || 'REDACTED_JWT_TOKEN';
    } else {
      // data.authToken = '$2a$10$1UO3e6b8NdzCX';
      data.authToken = '$2a$10$A8Bu9a7KJogPD';
      // data.authToken = '$2a$10$NggHX.VgJhIWi';
    }

    this.authService.authenticate({...data, ...{service: 'LOGIN'}}).subscribe(res => {
      console.log(res);
    });
  }

  newItems: {model:string; model_id: number; type:string; }[] = [];
  async triggerAchievement(identifier?: string) {
    if (identifier) {
      this.notificationsService.markTodoItemAsDone({identifier, id: 15629}).subscribe(res => {
        console.log('manual-marked::', res);
      })
      return;
    }

    this.notificationsService.markTodoItemAsDone({identifier: 'Achievement-'+13919}).subscribe(res => {
      this.newItems = res?.data?.meta?.new_items;
      console.log(this.newItems);
      this.sample = this.newItems;
      const uniqueEntries = this.unlockIndicatorService.transformAndDeduplicateTodoItem(this.newItems)/* 
        .forEach(item => {
          this.unlockIndicatorService.unlockTask(item.milestoneId, item.activityId, item.taskId);
        }); */
        console.log(uniqueEntries);

      console.log('unlockedTasks::', this.storageService.get('unlockedTasks'));
      // this.unlockIndicatorService.unlockTask();
    });
  }

  getTodoList() {
    this.notificationsService.getTodoItems().subscribe(res => {
      console.log('todoiteams', res);
    });
  }
}
