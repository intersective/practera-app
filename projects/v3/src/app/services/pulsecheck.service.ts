import { Injectable } from '@angular/core';
import { PulseCheckSkill } from '@v3/services/home.service';

export interface SkillChangeDisplay {
  text: string;
  cssClass: string;
}

@Injectable({
  providedIn: 'root'
})
export class PulsecheckService {

  constructor() {}

  /**
   * Get formatted change display using change value from API
   * @param changeValue - The change value from API response
   * @returns Object with change text and CSS class
   */
  getSkillChangeDisplayFromValue(changeValue: number): SkillChangeDisplay | null {
    if (changeValue === 0) {
      return null;
    }

    // Convert change value to percentage (multiply by 100 and round to 1 decimal)
    const changePercent = Math.round(changeValue * 100 * 10) / 10;

    return {
      text: changePercent > 0 ? `+${changePercent}%` : `${changePercent}%`,
      cssClass: changePercent > 0 ? 'skill-change-positive' : 'skill-change-negative'
    };
  }
}
