/* eslint-disable no-console */
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '@v3/app/services/auth.service';
import { ExperienceService } from '@v3/app/services/experience.service';
import { FastFeedbackService } from '@v3/app/services/fast-feedback.service';
import { NotificationsService } from '@v3/app/services/notifications.service';
import { BrowserStorageService } from '@v3/app/services/storage.service';
import { SharedService } from '@v3/app/services/shared.service';
import { UnlockIndicatorService } from '@v3/app/services/unlock-indicator.service';
import { Achievement, AchievementService } from '@v3/app/services/achievement.service';
import { environment } from '../../../environments/environment';
import { FfmpegService } from '../../services/ffmpeg.service';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-devtool',
  templateUrl: './devtool.page.html',
  styleUrls: ['./devtool.page.scss'],
})
export class DevtoolPage implements OnInit, OnDestroy {
  turnUppyOff: boolean = true;
  tusUploadUrl: string;
  doneLogin: boolean = false;
  user: any = {};
  themeToggle = false;
  identifier: string = '';

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
    private unlockIndicatorService: UnlockIndicatorService,
    private achievementService: AchievementService,
    private ffmpegService: FfmpegService
  ) { }

  selectedFile: File | null = null;
  isCompressing = false;
  compressionProgress = 0;
  originalSize = 0;
  compressedSize = 0;
  isTranscoding = false;
  transcodeProgress = 0;
  transcodedSize = 0;
  private progressSub: Subscription | undefined;
  private transcodeSub: Subscription | undefined;

  handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.originalSize = this.selectedFile.size;
      this.compressionProgress = 0;
      this.compressedSize = 0;
    }
  }

  async compressSelectedVideo(): Promise<void> {
    if (!this.selectedFile) return;

    try {
      if (!this.ffmpegService.isFfmpegLoaded()) {
        await this.ffmpegService.loadFFmpeg();
      }

      this.isCompressing = true;
      this.compressionProgress = 0;

      this.progressSub = this.ffmpegService.progress$.subscribe(({ progress }) => {
        this.compressionProgress = Math.round(progress * 100);
      });

      const result = await this.ffmpegService.compressVideo(this.selectedFile);
      this.compressedSize = result.compressedSize;
      this.progressSub.unsubscribe();
      this.compressionProgress = 100;

      if (result.skipped) {
        console.log('compression skipped:', result.skipReason);
        this.isCompressing = false;
        return;
      }

      const url = URL.createObjectURL(result.file);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      this.isCompressing = false;
    } catch (error) {
      console.error(error);
      this.progressSub?.unsubscribe();
      this.isCompressing = false;
    }
  }

  async transcodeSelectedVideo(): Promise<void> {
    if (!this.selectedFile) return;

    try {
      if (!this.ffmpegService.isFfmpegLoaded()) {
        await this.ffmpegService.loadFFmpeg();
      }

      this.isTranscoding = true;
      this.transcodeProgress = 0;
      this.transcodedSize = 0;

      this.transcodeSub = this.ffmpegService.progress$.subscribe(({ progress }) => {
        this.transcodeProgress = Math.round(progress * 100);
      });

      const output = await this.ffmpegService.transcodeToMp4(this.selectedFile);
      this.transcodedSize = output.size;
      this.transcodeSub.unsubscribe();
      this.transcodeProgress = 100;

      const url = URL.createObjectURL(output);
      const a = document.createElement('a');
      a.href = url;
      a.download = output.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      this.isTranscoding = false;
    } catch (error) {
      console.error(error);
      this.transcodeSub?.unsubscribe();
      this.isTranscoding = false;
    }
  }

  async transcodeVideo() {
    try {
      if (this.ffmpegService.isFfmpegLoaded() === false) {
        await this.ffmpegService.loadFFmpeg();
      }

      this.isCompressing = true;
      const compressedFile = await this.ffmpegService.transcode();
      console.log('Compressed File:', compressedFile);

      const url = URL.createObjectURL(compressedFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'output.mp4';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      this.isCompressing = false;
    } catch (error) {
      console.error(error);
      this.isCompressing = false;
    }
  }

  ngOnInit() {
    this.doneLogin = this.authService.isAuthenticated();
    if (this.doneLogin) {
      this.user = this.storageService.get('me');
    }
    // Use matchMedia to check the user preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    // Initialize the dark theme based on the initial
    // value of the prefers-color-scheme media query
    this.initializeDarkTheme(prefersDark.matches);

    // Listen for changes to the prefers-color-scheme media query
    prefersDark.addEventListener('change', (mediaQuery) => this.initializeDarkTheme(mediaQuery.matches));
    this.updateViewportSize();
  }

  ngOnDestroy() {
    this.progressSub?.unsubscribe();
    this.transcodeSub?.unsubscribe();
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

  async pulsecheck() {
    this.storageService.set('fastFeedbackOpening', false);
    const response = await firstValueFrom(this.fastFeedbackService.pullFastFeedback({ modalOnly: true }));
    if (response.error) {
      console.error(response.message);
      return;
    }
    const modal = response;
    if (modal && modal.present) {
      await modal.present();
      await modal.onDidDismiss();
    }
  }

  async showErrorAlert() {
    try {
      throw new Error('Missing parameters');
    } catch (err) {
      await this.notificationsService.alert({
        header: $localize`Error submitting rating`,
        message: err.message ? $localize`Apologies for the inconvenience caused. Something went wrong. Error: ${err.message}` : JSON.stringify(err),
      });
      throw new Error(err);
    }
  }

  async showAlert() {
    this.notificationsService.alert({
      header: 'header',
      subHeader: 'subheader',
      message: 'body message',
      buttons: [
        'ok',
        'close',
        {
          text: 'dismiss with a message',
          handler: () => {
            this.notificationsService.alert({
              message: 'a message',
            });
          },
        },
        {
          text: 'open another alert',
          handler: () => {
            this.notificationsService.alert({
              header: 'another header',
              subHeader: 'another subheader',
              message: 'another body message with no button',
            });
          }
        }
      ]
    });
  }

  async reviewrating() {
    this.notificationsService.popUpReviewRating(1, false);
  }

  async testAuth(withAPIkey?: boolean) {
    const data: any = {};
    if (withAPIkey === true) {
      data.apikey = this.storageService.getUser().apikey || 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxNDA0MiwidXNlcm5hbWUiOiJsZWFybmVyXzAwOEBwcmFjdGVyYS5jb20iLCJ0aW1lbGluZV9pZCI6MjMzOSwicHJvZ3JhbV9pZCI6MjAzNCwiZXhwZXJpZW5jZV9pZCI6MTY3NywiaW5zdGl0dXRpb25faWQiOjUyLCJwcm9qZWN0X2lkIjoyMzk3LCJyb2xlIjoicGFydGljaXBhbnQiLCJpc3MiOiJodHRwczovL2FwaS5wcmFjdGVyYS5jb20iLCJpYXQiOjE2OTUzNzIzMDkxNjAsImV4cCI6MTY5NTM3MjM5NTU2MH0.GZqmW0LxX2AdV_SQb82y1-evsbJWLNpq-M6JMFS9B2axmLnWYo2cKUDadZQsA9NS1zx6us8r_mlXnwyWZEe4uemeKIldYDh5kuJcMaCjxGdfzXgRxTLZHvCDrP6VOBX1OcBzfb3RO0Whq_OMUQgVhokIgUKEhSirQajkztmQGohSycsu4DV6_MK3jyVqjzP1OggRPkpSddgpWgFFgM2effSoQZ_YdLXq1pfNeDakR2Xmo9nN69AwiJ744bG-lygNbhj6hOHmBsfPJbVfzKwnvdelt2k9u3rkjd-GzQn26xT15RXVpBEm8EILDDcB_ZNFpJQA9Di89JIh97f-pk6x_7mwU3ouI_Qi5rWLsXJwpPQ2XDjcb5cgLzCgd60QKaAzQtzcLFAhHlSmbwdeEj5QYIxcGOemr7QLw6Ermp7otwfNfLu-oZRfutuRkQucOD1qracoz_uZo9sOwyil9HTwn3Z_x8myFiI0l3lSDuNtcTVgHs4__LhTJWoaTUTkEZr8IGoio9KmF1CcLkVpV-cf2kMCsMy76Txe7zQx1f403g5cX4wll3bjU5Sr00pqZX5PUIK4QQr5uzaHYl4wj7l9Q6VqKUix9pQvH7d54dykML-ZiL6SKDTPCKM1YNWf7RH76_eAahOf0Pcdw1jmUhPMkp3oc3NRywrJN5uKSYXL_j8';
    } else {
      // data.authToken = '$2a$10$1UO3e6b8NdzCX';
      data.authToken = '$2a$10$A8Bu9a7KJogPD';
      // data.authToken = '$2a$10$NggHX.VgJhIWi';
    }

    this.authService.authenticate({...data, ...{service: 'LOGIN'}}).subscribe(res => {
      console.log(res);
    });
  }

  // Check/uncheck the toggle and update the theme based on isDark
  initializeDarkTheme(isDark) {
    this.themeToggle = isDark;
    this.toggleDarkTheme(isDark);
  }

  // Listen for the toggle check/uncheck to toggle the dark theme
  toggleChange(ev) {
    this.toggleDarkTheme(ev.detail.checked);
  }

  // Add or remove the "dark" class on the document body
  toggleDarkTheme(shouldAdd) {
    document.body.classList.toggle('dark', shouldAdd);
  }

  newItems: { id: number; model: string; model_id: number; type: string; }[] = [];
  async triggerAchievement(identifier?: string) {
    if (identifier) {
      this.notificationsService.markTodoItemAsDone({ identifier }).subscribe(res => {
        console.log('manual-marked::', res);
      })
      return;
    }

    // mark todo with status (repeatable)
    this.notificationsService.markTodoItemAsDone({identifier: 'Achievement-'+13919}).subscribe(res => {
      this.newItems = res?.data?.meta?.new_items;
      console.log(this.newItems);
      const uniqueEntries = this.unlockIndicatorService.transformAndDeduplicate(this.newItems);
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

  tusChanged() {
    this.turnUppyOff = true;
  }

  applyTusUploadUrl() {
    this.turnUppyOff = false;
  }
}
