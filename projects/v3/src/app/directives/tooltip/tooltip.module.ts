import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipDirective } from './tooltip.directive';

@NgModule({
  declarations: [TooltipDirective],
  imports: [CommonModule],
  exports: [TooltipDirective]
})
export class TooltipModule {
  constructor() {
    // inject tooltip styles into document head
    if (!document.querySelector('style[data-tooltip-styles]')) {
      const styleElement = document.createElement('style');
      styleElement.setAttribute('data-tooltip-styles', 'true');
      styleElement.textContent = `
        .app-tooltip {
          position: fixed;
          background-color: rgba(0, 0, 0, 0.9);
          color: #fff;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          max-width: 300px;
          white-space: normal;
          word-wrap: break-word;
          pointer-events: none;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
          z-index: 100000;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
        }

        .app-tooltip.app-tooltip-visible {
          opacity: 1;
          visibility: visible;
        }

        .app-tooltip.app-tooltip-warning {
          background-color: gray;
        }

        .app-tooltip-arrow {
          position: absolute;
          width: 0;
          height: 0;
        }

        .app-tooltip-arrow.app-tooltip-arrow-top {
          top: -6px;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-bottom: 6px solid rgba(0, 0, 0, 0.9);
        }

        .app-tooltip-arrow.app-tooltip-arrow-bottom {
          bottom: -6px;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid rgba(0, 0, 0, 0.9);
        }

        .app-tooltip-arrow.app-tooltip-arrow-left {
          left: -6px;
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
          border-right: 6px solid rgba(0, 0, 0, 0.9);
        }

        .app-tooltip-arrow.app-tooltip-arrow-right {
          right: -6px;
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
          border-left: 6px solid rgba(0, 0, 0, 0.9);
        }
      `;
      document.head.appendChild(styleElement);
    }
  }
}
