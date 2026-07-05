import { ChangeDetectorRef, Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { of } from 'rxjs';
import { Achievement, AchievementService } from '@v3/app/services/achievement.service';
import { BadgeDetailModalComponent } from '@v3/app/components/badge-detail-modal/badge-detail-modal.component';
import { UtilsService } from '@v3/services/utils.service';

const PAGE_SIZE = 10;

@Component({
  standalone: false,
  selector: 'app-badges-certificates',
  templateUrl: './badges-certificates.page.html',
  styleUrls: ['./badges-certificates.page.scss'],
})
export class BadgesCertificatesPage implements OnInit, OnDestroy {
  /** All badges loaded from the `badges` query */
  allBadges: Achievement[] = [];
  /** Filtered list shown in the active tab */
  filteredBadges: Achievement[] = [];
  /** Currently visible page slice */
  displayedBadges: Achievement[] = [];

  activeTab: 'badge' | 'superbadge' = 'badge';
  loading = true;
  currentPage = 1;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private router: Router,
    private modalController: ModalController,
    private achievementService: AchievementService,
    private utils: UtilsService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  ngOnInit() {
    this.utils.setPageTitle('Badges & Certificates - Practera');
    this._loadBadges();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private _loadBadges() {
    this.loading = true;
    this.achievementService
      .getBadges()
      .pipe(
        takeUntil(this.unsubscribe$),
        catchError(() => of([]))
      )
      .subscribe((badges) => {
        this.ngZone.run(() => {
          this.allBadges = badges;
          this.loading = false;
          this._applyFilter();
          this.cdr.markForCheck();
        });
      });
  }

  private _applyFilter() {
    this.currentPage = 1;
    this.filteredBadges = this.allBadges.filter(
      (b) => b.type === this.activeTab
    );
    this._updatePage();
  }

  private _updatePage() {
    this.displayedBadges = this.filteredBadges.slice(0, this.currentPage * PAGE_SIZE);
  }

  get hasMore(): boolean {
    return this.displayedBadges.length < this.filteredBadges.length;
  }

  switchTab(event: any) {
    this.activeTab = event.detail.value;
    this._applyFilter();
  }

  loadMore() {
    this.currentPage++;
    this._updatePage();
  }

  async openBadgeDetail(achievement: Achievement, keyboardEvent?: KeyboardEvent) {
    if (
      keyboardEvent &&
      keyboardEvent.key !== 'Enter' &&
      keyboardEvent.key !== ' '
    ) {
      return;
    }
    if (keyboardEvent) {
      keyboardEvent.preventDefault();
    }
    const modal = await this.modalController.create({
      component: BadgeDetailModalComponent,
      componentProps: { achievement },
      cssClass: 'badge-detail-modal',
    });
    await modal.present();
  }

  goBack() {
    this.router.navigate(['v3', 'settings']);
  }
}
