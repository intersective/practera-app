import { Component, AfterContentChecked } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Injectable } from '@angular/core';
import { RouterEnter } from '@services/router-enter.service';
import { SwitcherService, ProgramObj } from '../switcher.service';
import { LoadingController } from '@ionic/angular';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { NotificationService } from '@shared/notification/notification.service';
import { BrowserStorageService, Stack } from '@services/storage.service';
import { UtilsService } from '@app/services/utils.service';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-switcher-program',
  templateUrl: 'switcher-program.component.html',
  styleUrls: ['switcher-program.component.scss']
})

export class SwitcherProgramComponent extends RouterEnter implements AfterContentChecked {
  routeUrl = '/switcher/switcher-program';
  programs: Array<ProgramObj>;
  isProgramsLoading = true;
  stacks: Stack[];

  constructor(
    public loadingController: LoadingController,
    public router: Router,
    private switcherService: SwitcherService,
    private newRelic: NewRelicService,
    private notificationService: NotificationService,
    private activatedRoute: ActivatedRoute,
    readonly storage: BrowserStorageService,
    readonly utils: UtilsService,
  ) {
    super(router);
    this.activatedRoute.data.subscribe(data => {
      this.stacks = data.stacks;
    });
  }

  onEnter() {
    this.programs = [];
    this.newRelic.setPageViewName('program switcher');
    this.switcherService.getPrograms(this.stacks).subscribe(
      async programs => {
        // redirect user back to login if didn't found any program for the user.
        if (programs.length <= 0) {
          return this.notificationService.alert({
            header: 'Error in accessing experiences',
            message: `Didn't find any experience user has access to enter. Please Login using another valid account.`,
            buttons: [
              {
                text: 'OK',
                role: 'cancel',
                handler: () => {
                  this.isProgramsLoading = false;
                  this.router.navigate(['logout']);
                },
              },
            ],
          });
        }

        this.programs = programs;

        // IF user have access to only one program then switch to it
        if (programs.length === 1) {
          await this.switch(0);
        } else {
          this.isProgramsLoading = false;
        }
      },
      error => {
        this.isProgramsLoading = false;
      });
  }

  ngAfterContentChecked() {
    document.getElementById('page-title').focus();
  }

  async switch(index): Promise<void> {
    const nrSwitchedProgramTracer = this.newRelic.createTracer('switching program');
    const loading = await this.loadingController.create({
      message: 'loading...'
    });
    this.newRelic.actionText(`selected ${this.programs[index].program.name}`);

    await loading.present();

    try {
      this.storage.setUser({apikey: this.programs[index].apikey});
      this.storage.set('programs', this.programs);
      this.storage.set('isLoggedIn', true);
      this.storage.stackConfig = this.programs[index].stack;

      const route = await this.switcherService.switchProgramAndNavigate(this.programs[index]);
      loading.dismiss().then(() => {
        this.isProgramsLoading = false;
        nrSwitchedProgramTracer();
        this.router.navigate(route);
      });
    } catch (err) {
      await this.notificationService.alert({
        header: 'Error switching program',
        message: err.msg || JSON.stringify(err)
      });

      nrSwitchedProgramTracer();
      this.newRelic.noticeError('switch program failed', JSON.stringify(err));
    }
    return;
  }
}
