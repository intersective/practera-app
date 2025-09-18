import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[toggleLabel]',
  standalone: true
})
export class ToggleLabelDirective {
  @Input('toggleLabel') toggleFn!: (id: string) => void;
  @Input() toggleId!: string;
  @Input() toggleDisabled = false;

  @HostListener('click', ['$event'])
  onClick(ev: MouseEvent) {
    if (this.toggleDisabled) return;
    const el = ev.target as HTMLElement | null;
    if (el && el.closest('a')) return;
    ev.preventDefault();
    ev.stopPropagation();
    this.toggleFn?.(this.toggleId);
  }

  @HostListener('keydown', ['$event'])
  onKeydown(ev: KeyboardEvent) {
    if (this.toggleDisabled) return;
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      ev.stopPropagation();
      this.toggleFn?.(this.toggleId);
    }
  }
}
