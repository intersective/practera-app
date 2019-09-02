import { Component, OnInit, Input } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Injectable, Inject } from '@angular/core';

// import { Router } from '@angular/router';
// import { LoadingController } from '@ionic/angular';
// import { environment } from '@environments/environment';
// import { PusherService } from '@shared/pusher/pusher.service';
// import { SwitcherService, ProgramObj } from '../../../switcher/switcher.service';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-path-card',
  templateUrl: './path-card.component.html',
  styleUrls: ['./path-card.component.scss']
})
export class PathCardComponent implements OnInit {
  @Input() loading: boolean;
  @Input() path: {
    id: number,
    name: string,
    isLocked?: boolean,
    progress?: number,
    hasFeedback?: boolean,
    leadImage?: string,
  }
  backgroundImageStyle: string = '';
  backgroundImageStyle1: string = '';
  backgroundImageStyle2: string = '';
  backgroundImageStyle3: string = '';
  backgroundImageStyle4: string = '';
  pathLoading: boolean = true;
  constructor ( 
    @Inject(DOCUMENT) private document: Document,
    // public router: Router,
    // private pusherService: PusherService,
    // private switcherService: SwitcherService,
    // public loadingController: LoadingController
   ) { }

  ngOnInit() {
    if (!this.path) {
      this.pathLoading = false;
    }
    console.log(this.path);
    this.backgroundImageStyle = '';
    this.backgroundImageStyle1 = 'url(/assets/cards/employability.png), linear-gradient( rgba(0, 0, 0, .4), rgba(0, 0, 0, 0.2) )';
    this.backgroundImageStyle2 = 'url(https://smallbiztrends.com/wp-content/uploads/2016/05/shutterstock_311472353.jpg), linear-gradient( rgba(0, 0, 0, .4), rgba(0, 0, 0, 0.2) )';
    this.backgroundImageStyle3 = 'url(/assets/cards/map.jpg), linear-gradient( rgba(0, 0, 0, .4), rgba(0, 0, 0, 0.2) )';
    this.backgroundImageStyle4 = 'url(/assets/cards/credentials.png), linear-gradient( rgba(0, 0, 0, .4), rgba(0, 0, 0, 0.2) )';
    
    if (this.path.leadImage) {
      this.backgroundImageStyle = 'url(' + this.path.leadImage + '), linear-gradient( rgba(0, 0, 0, .4), rgba(0, 0, 0, 0.2) )';
    }
  }

  // async switch(index) {
  //   const loading = await this.loadingController.create({
  //     message: 'loading...'
  //   });

  //   await loading.present();

  //   // for passport redirect to skills passport app
  //   if (index == 'passport') {

  //   } else {
  //     return this.switcherService.switchProgram(this.programs[index]).subscribe(() => {
  //       loading.dismiss().then(() => {
  //         // reset pusher (upon new timelineId)
  //         this.pusherService.initialise({ unsubscribe: true });

  //         if ((typeof environment.goMobile !== 'undefined' && environment.goMobile === false)
  //           || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
  //           return this.router.navigate(['app', 'home']);
  //         } else {
  //           return this.router.navigate(['go-mobile']);
  //         }
  //       });
  //     });
  //   }
  // }
}
