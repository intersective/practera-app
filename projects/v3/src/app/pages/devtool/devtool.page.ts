import { Component, HostListener, OnInit } from '@angular/core';
import { AuthService } from '@v3/app/services/auth.service';
import { ExperienceService } from '@v3/app/services/experience.service';
import { FastFeedbackService } from '@v3/app/services/fast-feedback.service';
import { NotificationsService } from '@v3/app/services/notifications.service';
import { BrowserStorageService } from '@v3/app/services/storage.service';
import { SharedService } from '@v3/app/services/shared.service';
import { UnlockIndicatorService } from '@v3/app/services/unlock-indicator.service';
import { Achievement, AchievementService } from '@v3/app/services/achievement.service';

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
  viewportWidth: number;
  viewportHeight: number;

  info: {
    userAgent: string;
    viewportWidth: number;
    viewportHeight: number;
    screenWidth: number;
    screenHeight: number;
    pixelRatio: number;
    location: {
      latitude: number;
      longitude: number;
    };
  }

  constructor(
    private authService: AuthService,
    private storageService: BrowserStorageService,
    private fastFeedbackService: FastFeedbackService,
    private notificationsService: NotificationsService,
    private experienceService: ExperienceService,
    private sharedService: SharedService,
    private achievementService: AchievementService,
    private unlockIndicatorService: UnlockIndicatorService
      ) { }

  ngOnInit() {
    this.doneLogin = this.authService.isAuthenticated();
    if (this.doneLogin) {
      this.user = this.storageService.get('me');
    }

    this.updateViewportSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.updateViewportSize();
  }

  updateViewportSize() {
    this.viewportWidth = window.innerWidth;
    this.viewportHeight = window.innerHeight;
    this.deviceInfo();
  }

  refresh() {
    this.authService.authenticate().subscribe();
  }

  login() {
    /* this.authService.authenticate({
      email: 'learner_008@practera.com',
      password: 'REDACTED_TEST_PASSWORD'
    }).subscribe(res => {
      this.doneLogin = true;
      this.user = res;
      this.authService.getMyInfo();
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

  newItems: {id: number; model:string; model_id: number; type:string; }[] = [];
  async triggerAchievement(identifier?: string) {
    if (identifier) {
      this.notificationsService.markTodoItemAsDone({identifier, id: 15629}).subscribe(res => {
        console.log('manual-marked::', res);
      })
      return;
    }

    // mark todo with status (repeatable)
    this.notificationsService.markTodoItemAsDone({identifier: 'Achievement-'+13919}).subscribe(res => {
      this.newItems = res?.data?.meta?.new_items;
      console.log(this.newItems);
      const uniqueEntries = this.unlockIndicatorService.transformAndDeduplicateTodoItem(this.newItems);
      this.sample = uniqueEntries;
      console.log(uniqueEntries);

      console.log('unlockedTasks::', this.storageService.get('unlockedTasks'));
    });
  }

  // called to update unlocked tasks
  getTodoList() {
    this.notificationsService.getTodoItems().subscribe(res => {
      console.log('todoiteams', res);
    });
  }

  markAllUnlockTaskDone() {
    this.unlockIndicatorService.allUnlockedTasks().forEach(task => {
      this.notificationsService.markTodoItemAsDone(task).subscribe(res => {
        console.log('res', res);
      });
      this.unlockIndicatorService.removeTasks(task.taskId);
    });
  }

  getbadges() {
    this.achievementService.getAchievements();
  }

  deviceInfo() {
    this.info = {
      // User Agent
      userAgent: navigator.userAgent,

      // Viewport Size
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,

      // Screen Resolution
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,

      // Pixel Ratio
      pixelRatio: window.devicePixelRatio || 1,

      // Geolocation (initialized as null)
      location: null,
    };

    // Geolocation (optional)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.info.location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  }
}
