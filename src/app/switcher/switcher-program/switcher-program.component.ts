import { Component, AfterContentChecked } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Injectable } from '@angular/core';
import { RouterEnter } from '@services/router-enter.service';
import { SwitcherService, ProgramObj } from '../switcher.service';
import { LoadingController } from '@ionic/angular';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { NotificationService } from '@shared/notification/notification.service';
import { BrowserStorageService } from '@services/storage.service';

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
  stacks: Stack[];

  constructor(
    public loadingController: LoadingController,
    public router: Router,
    private switcherService: SwitcherService,
    private newRelic: NewRelicService,
    private notificationService: NotificationService,
    private activatedRoute: ActivatedRoute,
    readonly storage: BrowserStorageService,
  ) {
    super(router);
    this.activatedRoute.data.subscribe(data => {
      this.stacks = data.stacks;
    });
  }

  onEnter() {
    this.newRelic.setPageViewName('program switcher');
    this.switcherService.getPrograms()
      .subscribe(programs => {
        this.programs = programs;
        this._getProgresses(programs);
      });
  }

  ngAfterContentChecked() {
    document.getElementById('page-title').focus();
  }

  private _getProgresses(programs) {
    const projectIds = programs.map(v => v.project.id);
    this.switcherService.getProgresses(projectIds).subscribe(res => {
      res.forEach(progress => {
        const i = this.programs.findIndex(program => program.project.id === progress.id);
        this.programs[i].progress = progress.progress;
        this.programs[i].todoItems = progress.todoItems;
      });
    });
  }

  /**
   * set and switch to provided stack and program
   *
   * @param   {number}  programIndex index number of programs
   * @param   {number}  stackIndex stack number of stacks
   * @return  {Promise<void>}
   */
  async switch(programIndex: number, stackIndex: number): Promise<void> {
    const nrSwitchedProgramTracer = this.newRelic.createTracer('switching program');
    const loading = await this.loadingController.create({
      message: 'loading...'
    });
    this.newRelic.actionText(`selected ${this.programs[programIndex].program.name}`);

    await loading.present();

    try {
      this.storage.stackConfig = this.stacks[stackIndex];

      const route = await this.switcherService.switchProgramAndNavigate(this.programs[programIndex]);
      loading.dismiss().then(() => {
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
