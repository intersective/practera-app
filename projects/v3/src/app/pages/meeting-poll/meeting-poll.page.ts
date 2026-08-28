import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ModalController, AlertController, LoadingController, ToastController } from '@ionic/angular';
import { MeetingPollService, MeetingPoll, MeetingPollSlot } from '@v3/services/meeting-poll.service';
import { UtilsService } from '@v3/services/utils.service';

type UiMode = 'list' | 'create' | 'vote';

interface SlotDraft {
  slotStart: string;
  slotEnd: string;
}

@Component({
  standalone: false,
  selector: 'app-meeting-poll',
  templateUrl: './meeting-poll.page.html',
  styleUrls: ['./meeting-poll.page.scss'],
})
export class MeetingPollPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  teamId: number | null = null;

  // list view
  polls: MeetingPoll[] = [];
  loading = false;

  // active view mode
  mode: UiMode = 'list';

  // create mode fields
  createTitle = '';
  createDescription = '';
  createDuration = 60;
  createLocation = '';
  createDeadline = '';
  createSlots: SlotDraft[] = [
    { slotStart: '', slotEnd: '' },
    { slotStart: '', slotEnd: '' },
  ];
  creating = false;

  // vote mode
  votingPoll: MeetingPoll | null = null;
  myVotes: Record<number, 'available' | 'unavailable' | 'maybe'> = {};
  voting = false;

  constructor(
    private route: ActivatedRoute,
    private pollService: MeetingPollService,
    private utils: UtilsService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
  ) {}

  get isMobile(): boolean {
    return this.utils.isMobile();
  }

  ngOnInit() {
    this.utils.setPageTitle('Meeting Polls - Practera');
    this.teamId = +this.route.snapshot.queryParamMap.get('teamId') || null;
    this.loadPolls();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPolls() {
    if (!this.teamId) return;
    this.loading = true;
    this.pollService.getTeamPolls(this.teamId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: polls => { this.polls = polls; this.loading = false; },
        error: () => { this.loading = false; },
      });
  }

  // ─── CREATE FLOW ────────────────────────────────────────────────────────────

  openCreate() {
    this.createTitle = '';
    this.createDescription = '';
    this.createDuration = 60;
    this.createLocation = '';
    this.createDeadline = '';
    this.createSlots = [
      { slotStart: '', slotEnd: '' },
      { slotStart: '', slotEnd: '' },
    ];
    this.mode = 'create';
  }

  addSlot() {
    if (this.createSlots.length < 6) {
      this.createSlots.push({ slotStart: '', slotEnd: '' });
    }
  }

  removeSlot(index: number) {
    if (this.createSlots.length > 2) {
      this.createSlots.splice(index, 1);
    }
  }

  async submitCreate() {
    if (!this.teamId) return;
    if (!this.createTitle.trim()) {
      this.showToast('Please enter a meeting title');
      return;
    }
    const validSlots = this.createSlots.filter(s => s.slotStart && s.slotEnd);
    if (validSlots.length < 2) {
      this.showToast('Please add at least 2 time slots');
      return;
    }

    this.creating = true;
    this.pollService.createPoll({
      teamId: this.teamId,
      title: this.createTitle.trim(),
      description: this.createDescription.trim() || undefined,
      durationMinutes: this.createDuration,
      location: this.createLocation.trim() || undefined,
      slots: validSlots,
      deadline: this.createDeadline || undefined,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: poll => {
        this.creating = false;
        if (poll) {
          this.polls.unshift(poll);
          this.mode = 'list';
          this.showToast('Meeting poll created! Your team can now vote on the times.');
        }
      },
      error: (err) => {
        this.creating = false;
        this.showToast(err?.message ?? 'Failed to create poll');
      },
    });
  }

  // ─── VOTE FLOW ──────────────────────────────────────────────────────────────

  openVote(poll: MeetingPoll) {
    this.votingPoll = poll;
    this.myVotes = {};
    // Pre-fill votes from existing data (assuming current user's userId is in slots.votes)
    this.mode = 'vote';
  }

  setVote(slotId: number, vote: 'available' | 'unavailable' | 'maybe') {
    this.myVotes[slotId] = vote;
  }

  getVote(slotId: number): string {
    return this.myVotes[slotId] ?? '';
  }

  async submitVotes() {
    if (!this.votingPoll) return;
    const slotIds = Object.keys(this.myVotes).map(Number);
    if (!slotIds.length) {
      this.showToast('Please vote on at least one time slot');
      return;
    }

    this.voting = true;
    let remaining = slotIds.length;
    let hasError = false;

    for (const slotId of slotIds) {
      this.pollService.vote(slotId, this.myVotes[slotId])
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            remaining--;
            if (remaining === 0 && !hasError) {
              this.voting = false;
              this.mode = 'list';
              this.loadPolls();
              this.showToast('Your availability has been recorded.');
            }
          },
          error: (err) => {
            hasError = true;
            this.voting = false;
            this.showToast(err?.message ?? 'Failed to save votes');
          },
        });
    }
  }

  async confirmCancel(poll: MeetingPoll) {
    const alert = await this.alertCtrl.create({
      header: 'Cancel Poll',
      message: `Are you sure you want to cancel the poll "${poll.title}"?`,
      buttons: [
        { text: 'No', role: 'cancel' },
        {
          text: 'Yes, Cancel',
          role: 'destructive',
          handler: () => {
            this.pollService.cancelPoll(poll.id)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: () => {
                  this.loadPolls();
                  this.showToast('Poll cancelled');
                },
              });
          },
        },
      ],
    });
    await alert.present();
  }

  slotLabel(slot: MeetingPollSlot): string {
    const start = new Date(slot.slotStart);
    const end = new Date(slot.slotEnd);
    const day = start.toLocaleDateString('en-AU', { weekday: 'short', month: 'short', day: 'numeric' });
    const startTime = start.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
    const endTime = end.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
    return `${day}, ${startTime}–${endTime}`;
  }

  statusBadge(status: string): string {
    const map: Record<string, string> = {
      open: 'success',
      closed: 'medium',
      scheduled: 'primary',
      cancelled: 'danger',
    };
    return map[status] ?? 'medium';
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'top',
      color: 'dark',
    });
    await toast.present();
  }

  goBack() {
    if (this.mode !== 'list') {
      this.mode = 'list';
    }
  }
}
