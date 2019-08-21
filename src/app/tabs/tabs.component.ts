import { Component, OnDestroy, OnInit } from '@angular/core';
import { TabsService } from './tabs.service';
import { UtilsService } from '@services/utils.service';
import { BrowserStorageService } from '@services/storage.service';
import { RouterEnter } from '@services/router-enter.service';
import { SwitcherService } from '../switcher/switcher.service';
import { ReviewsService } from '../reviews/reviews.service';
import { Router, NavigationEnd } from '@angular/router';
import { SharedService } from '@services/shared.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.component.html',
  styleUrls: ['tabs.component.scss']
})
export class TabsComponent implements OnDestroy, OnInit {
  showReview = false;
  showChat = false;
  noOfTodoItems = 0;
  noOfChats = 0;
  selectedTab = '';

  private getNoOfTodoItems: Subscription;
  private getNoOfChats: Subscription;
  private getTeamInfo: Subscription;
  private getReviews: Subscription;

  constructor(
    public router: Router,
    private tabsService: TabsService,
    public storage: BrowserStorageService,
    public utils: UtilsService,
    private switcherService: SwitcherService,
    private reviewsService: ReviewsService,
    private sharedService: SharedService,
  ) {
    const { role } = this.storage.getUser();
    this.utils.getEvent('notification').subscribe(event => {
      this.noOfTodoItems++;
    });
    this.utils.getEvent('event-reminder').subscribe(event => {
      this.noOfTodoItems++;
    });
    this.utils.getEvent('team-message').subscribe(event => {
      this.tabsService.getNoOfChats().subscribe(noOfChats => {
        this.noOfChats = noOfChats;
      });
    });
    if (role !== 'mentor') {
      this.utils.getEvent('team-no-mentor-message').subscribe(event => {
        this.tabsService.getNoOfChats().subscribe(noOfChats => {
          this.noOfChats = noOfChats;
        });
      });
    }

    // keep manually fire API call for latest data (every route change)
    this.router.events.subscribe(res => {
      if (res instanceof NavigationEnd) {
        this.ngOnInit();
        this.getNoOfTodoItems = this.tabsService.getNoOfTodoItems().subscribe(noOfTodoItems => {
          this.noOfTodoItems = noOfTodoItems;
        });

        const { teamId } = this.storage.getUser();
        // only get the number of chats if user is in team
        if (teamId) {
          this.getNoOfChats = this.tabsService.getNoOfChats().subscribe(noOfChats => {
            this.noOfChats = noOfChats;
          });
        }
        this.getTeamInfo = this.switcherService.getTeamInfo().subscribe(data => {
          if (teamId) {
            this.showChat = true;
          } else {
            this.showChat = false;
          }
        });
        this.getReviews = this.reviewsService.getReviews().subscribe(data => {
          if (data.length) {
            this.showReview = true;
          }
        });
      }
    });
  }

  ionViewWillLeave() {
    this.ngOnDestroy();
  }

  ngOnDestroy() {
    console.log('TabComponent::onDestroy');
    if (this.getNoOfTodoItems) {
      this.getNoOfTodoItems.unsubscribe();
    }
    if (this.getNoOfChats) {
      this.getNoOfChats.unsubscribe();
    }
    if (this.getTeamInfo) {
      this.getTeamInfo.unsubscribe();
    }
    if (this.getReviews) {
      this.getReviews.unsubscribe();
    }
  }

  private _initialise() {
    this.showChat = false;
    this.showReview = false;
  }

  ngOnInit() {
    this._initialise();
    this._checkRoute();
    this._stopPlayingVideos();
  }

  private _checkRoute() {
    switch (this.router.url) {
      case '/app/home':
        this.selectedTab = 'home';
        break;

      case '/app/project':
        this.selectedTab = 'project';
        break;

      case '/app/settings':
        this.selectedTab = 'settings';
        break;

      case '/app/chat':
        this.selectedTab = 'chat';
        break;

      default:
        if (this.router.url.includes('/app/activity')) {
          this.selectedTab = 'project';
        } else if (this.router.url.includes('/app/reviews')) {
          this.selectedTab = 'reviews';
        } else {
          this.selectedTab = '';
        }
        break;
    }
  }

  private _stopPlayingVideos() {
    this.sharedService.stopPlayingViodes();
  }
}
