import {
  Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef, NgZone
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { QuillModules } from 'ngx-quill';
import { ChatService, Message } from '@v3/services/chat.service';
import { UtilsService } from '@v3/services/utils.service';

@Component({
  standalone: false,
  selector: 'app-thread-panel',
  templateUrl: './thread-panel.component.html',
  styleUrls: ['./thread-panel.component.scss'],
})
export class ThreadPanelComponent implements OnInit, OnDestroy {
  @Input() rootMessage: Message;
  @Input() channelUuid: string;
  @Input() channelName: string = '';
  @Input() channelReadonly: boolean = false;
  /** Pass experienceId to enable AI expert invite picker */
  @Input() experienceId?: number;

  @Output() closed = new EventEmitter<void>();
  @Output() replyCountChanged = new EventEmitter<{ rootUuid: string; count: number }>();

  replies: Message[] = [];
  replyText: string = '';
  loadingReplies = false;
  sendingReply = false;
  cursor: string | null = null;
  hasMore = false;
  showAiPicker = false;
  availableExperts: Array<{ id: number; name: string; description: string | null }> = [];
  invitingExpert = false;
  showEmojiPicker: string | null = null;
  commonEmojis = ['👍', '👎', '😀', '❤️', '🎉', '👀', '🚀', '😮'];

  private destroy$ = new Subject<void>();
  private pollInterval: ReturnType<typeof setInterval>;

  editorModules: QuillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
    ],
  };

  constructor(
    private chatService: ChatService,
    public utils: UtilsService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    this.loadReplies();

    // Load available AI experts for invite picker
    if (this.experienceId) {
      this.chatService.getAvailableThreadExperts(this.experienceId).subscribe({
        next: (experts) => {
          this.ngZone.run(() => {
            this.availableExperts = experts;
            this.cdr.markForCheck();
          });
        },
        error: () => { /* non-fatal */ },
      });
    }

    // Poll for new replies every 5s
    this.pollInterval = setInterval(() => {
      this.chatService.getThreadReplies(this.rootMessage.uuid, 50).subscribe({
        next: (result) => {
          this.ngZone.run(() => {
            const existingKeys = new Set(this.replies.map(r => this.msgKey(r)));
            const newReplies = result.replies.filter(r => !existingKeys.has(this.msgKey(r)));
            if (newReplies.length > 0) {
              this.replies = [...this.replies, ...newReplies];
              this.replyCountChanged.emit({
                rootUuid: this.rootMessage.uuid,
                count: result.rootMessage?.replyCount ?? this.replies.length,
              });
              this.cdr.markForCheck();
            }
          });
        },
        error: () => { /* ignore poll errors */ },
      });
    }, 5000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  loadReplies(): void {
    this.loadingReplies = true;
    this.chatService.getThreadReplies(this.rootMessage.uuid, 50).subscribe({
      next: (result) => {
        this.ngZone.run(() => {
          this.replies = result.replies;
          this.cursor = result.cursor;
          this.hasMore = !!result.cursor;
          this.loadingReplies = false;
          this.cdr.markForCheck();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.loadingReplies = false;
          this.cdr.markForCheck();
        });
      },
    });
  }

  sendReply(): void {
    if (!this.replyText || this.utils.isQuillContentEmpty(this.replyText)) return;
    this.sendingReply = true;
    const message = this.replyText;
    this.replyText = '';

    this.chatService.postNewMessage({
      channelUuid: this.channelUuid,
      message,
      parentMessageUuid: this.rootMessage.uuid,
    }).subscribe({
      next: (reply: Message) => {
        this.ngZone.run(() => {
          if (reply) {
            this.replies = [...this.replies, reply];
            this.replyCountChanged.emit({
              rootUuid: this.rootMessage.uuid,
              count: this.replies.length,
            });
          }
          this.sendingReply = false;
          this.cdr.markForCheck();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.sendingReply = false;
          this.cdr.markForCheck();
        });
      },
    });
  }

  close(): void {
    this.closed.emit();
  }

  toggleAiPicker(): void {
    this.showAiPicker = !this.showAiPicker;
  }

  inviteAiExpert(expertId: number): void {
    this.showAiPicker = false;
    this.invitingExpert = true;
    this.chatService.inviteAiToThread(this.rootMessage.uuid, expertId).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.invitingExpert = false;
          this.cdr.markForCheck();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.invitingExpert = false;
          this.cdr.markForCheck();
        });
      },
    });
  }

  getMessageDate(created: string): string {
    if (!created) return '';
    const d = new Date(created);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  /** Stable key for dedup + trackBy */
  msgKey(msg: Message): string {
    return msg.uuid || `id:${msg.chatLogId}` || `c:${msg.created}:${(msg.message ?? '').slice(0, 20)}`;
  }

  trackReply(_index: number, msg: Message): string {
    return this.msgKey(msg);
  }

  isAiMessage(msg: Message): boolean {
    return !msg.uuid;
  }

  isContinuation(msg: Message, index: number): boolean {
    const list = [this.rootMessage, ...this.replies];
    const realIndex = index + 1; // offset by root message
    if (realIndex === 0) return false;
    const prev = list[realIndex - 1];
    if (!prev) return false;
    const prevKey = prev.isSender ? '__me__' : (prev.senderUuid ?? prev.message?.slice(0, 10));
    const nextKey = msg.isSender ? '__me__' : (msg.senderUuid ?? msg.message?.slice(0, 10));
    if (prevKey !== nextKey) return false;
    if (!prev.created || !msg.created) return false;
    const diff = (new Date(msg.created).getTime() - new Date(prev.created).getTime()) / 1000;
    return diff < 300;
  }

  toggleEmojiPicker(msg: Message): void {
    const key = msg.uuid || `id:${msg.chatLogId}`;
    this.showEmojiPicker = this.showEmojiPicker === key ? null : key;
  }

  addReaction(msg: Message, emoji: string): void {
    this.showEmojiPicker = null;
    const params: any = { emoji };
    if (msg.uuid) params.chatLogUuid = msg.uuid;
    else if (msg.chatLogId) params.chatLogId = msg.chatLogId;
    else return;
    this.chatService.addReaction(params).pipe(takeUntil(this.destroy$)).subscribe(
      (res) => {
        const updated = res?.data?.addReaction;
        if (updated) {
          this.ngZone.run(() => {
            const all = [this.rootMessage, ...this.replies];
            const target = all.find(m =>
              (msg.uuid && m.uuid === msg.uuid) || (!msg.uuid && m.chatLogId === updated.chatLogId)
            );
            if (target) target.reactions = updated.reactions;
            this.cdr.markForCheck();
          });
        }
      },
      (err) => console.error('addReaction error:', err)
    );
  }

  removeReaction(msg: Message, emoji: string): void {
    const params: any = { emoji };
    if (msg.uuid) params.chatLogUuid = msg.uuid;
    else if (msg.chatLogId) params.chatLogId = msg.chatLogId;
    else return;
    this.chatService.removeReaction(params).pipe(takeUntil(this.destroy$)).subscribe(
      (res) => {
        const updated = res?.data?.removeReaction;
        if (updated) {
          this.ngZone.run(() => {
            const all = [this.rootMessage, ...this.replies];
            const target = all.find(m =>
              (msg.uuid && m.uuid === msg.uuid) || (!msg.uuid && m.chatLogId === updated.chatLogId)
            );
            if (target) target.reactions = updated.reactions;
            this.cdr.markForCheck();
          });
        }
      },
      (err) => console.error('removeReaction error:', err)
    );
  }
}
