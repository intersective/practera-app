import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '@v3/environments/environment';

/**
 * snow overlay component that renders animated snowflakes
 * as a transparent layer over the app content.
 * uses pointer-events: none to allow interaction with underlying elements.
 */
@Component({
  selector: 'app-snow-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './snow-overlay.component.html',
  styleUrls: ['./snow-overlay.component.scss'],
})
export class SnowOverlayComponent implements OnInit {
  snowflakes: Array<{
    id: number;
    size: number;
    left: number;
    delay: number;
    duration: number;
    opacity: number;
  }> = [];

  ngOnInit(): void {
    this.generateSnowflakes();
  }

  /**
   * generates snowflake configurations with randomized properties
   * for natural variation in the animation.
   */
  private generateSnowflakes(): void {
    const count = environment.snowAnimation?.snowflakeCount ?? 30;

    for (let i = 0; i < count; i++) {
      this.snowflakes.push({
        id: i,
        size: this.randomBetween(4, 10),
        left: this.randomBetween(0, 100),
        delay: this.randomBetween(0, 10),
        duration: this.randomBetween(8, 15),
        opacity: this.randomBetween(0.4, 1),
      });
    }
  }

  /**
   * returns a random number between min and max (inclusive).
   */
  private randomBetween(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  /**
   * trackby function for ngfor performance optimization.
   */
  trackByFlakeId(index: number, flake: { id: number }): number {
    return flake.id;
  }
}
