import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

// 8-color palette — deterministic background based on name (same palette as admin app).
const AVATAR_COLORS: string[] = [
  '#0f766e', // teal-700
  '#1d4ed8', // blue-700
  '#6d28d9', // violet-700
  '#be123c', // rose-700
  '#b45309', // amber-700
  '#047857', // emerald-700
  '#0e7490', // cyan-700
  '#4338ca', // indigo-700
];

function pickColor(name: string): string {
  if (!name) return AVATAR_COLORS[0];
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';

const SIZE_PX: Record<AvatarSize, string> = {
  xs: '24px',
  sm: '32px',
  md: '40px',
  lg: '56px',
};

const FONT_SIZE_PX: Record<AvatarSize, string> = {
  xs: '10px',
  sm: '12px',
  md: '13px',
  lg: '16px',
};

/**
 * AvatarComponent — shows a photo when available, falls back to colored initials.
 *
 * Progressive loading:
 *   1. Initials render instantly.
 *   2. If `avatarUrl` is a real URL the image is loaded over the initials.
 *   3. If the image fails the initials remain visible.
 */
@Component({
  selector: 'app-avatar',
  standalone: false,
  template: `
    <div
      class="avatar-root"
      [style.width]="sizePx"
      [style.height]="sizePx"
      [style.background-color]="bgColor"
      [attr.aria-label]="name + ' avatar'"
      role="img"
    >
      <!-- Initials layer — always visible -->
      <span
        class="avatar-initials"
        [style.font-size]="fontSizePx"
        aria-hidden="true"
      >{{ initials }}</span>

      <!-- Photo layer — displayed once loaded, hidden on error -->
      @if (avatarUrl && !imgFailed) {
        <img
          [src]="avatarUrl"
          alt=""
          aria-hidden="true"
          class="avatar-img"
          (error)="onImgError()"
        />
      }
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
      flex-shrink: 0;
    }

    .avatar-root {
      position: relative;
      border-radius: 50%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      user-select: none;
    }

    .avatar-initials {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: white;
      line-height: 1;
    }

    .avatar-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }
  `],
})
export class AvatarComponent implements OnChanges {
  @Input() name: string = '';
  @Input() avatarUrl: string | null = null;
  @Input() size: AvatarSize = 'md';

  initials = '?';
  bgColor = AVATAR_COLORS[0];
  sizePx = SIZE_PX.md;
  fontSizePx = FONT_SIZE_PX.md;
  imgFailed = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['name'] || changes['size']) {
      this.initials = getInitials(this.name);
      this.bgColor = pickColor(this.name);
      this.sizePx = SIZE_PX[this.size] ?? SIZE_PX.md;
      this.fontSizePx = FONT_SIZE_PX[this.size] ?? FONT_SIZE_PX.md;
    }
    if (changes['avatarUrl']) {
      // Reset error state when URL changes so new URL gets a fresh attempt
      this.imgFailed = false;
    }
  }

  onImgError(): void {
    this.imgFailed = true;
  }
}
