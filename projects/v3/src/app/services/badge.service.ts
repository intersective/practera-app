import { Injectable } from '@angular/core';

export interface Badge {
  id: number;
  name: string;
  description: string;
  points?: number;
  image?: string;
  isEarned?: boolean;
  earnedDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BadgeService {

  constructor() { }
}
