import { Inject, Injectable, InjectionToken } from '@angular/core';

export const BROWSER_STORAGE = new InjectionToken<Storage>('Browser Storage', {
  providedIn: 'root',
  factory: () => localStorage
});

export interface User {
  name?: string;
  apikey?: string;
  contactNumber?: string;
  email?: string;
  role?: string;
  image?: string;
  linkedinConnected?: boolean;
  linkedinUrl?: string;
  programId?: number;
  programName?: string;
  experienceId?: number;
  timelineId?: number;
  projectId?: number;
  teamId?: number;
  userHash?: string;
  maxAchievablePoints?: number;
  themeColor?: string;
  activityCardImage?: string;
  hasReviewRating?: boolean;
  truncateDescription?: boolean;
}

export interface Config {
  logo?: string;
  color?: string;
}

@Injectable({
  providedIn: 'root'
})

export class BrowserStorageService {
  public memoryCache: any;

  constructor(@Inject(BROWSER_STORAGE) public storage: Storage) {}

  get(key: string) {
    const cached = this.storage.getItem(key);
    if (cached) {
      return JSON.parse(this.storage.getItem(key) || null);
    }

    return null;
  }

  set(key: string, value: any) {
    return this.storage.setItem(key, JSON.stringify(value));
  }

  append(key: string, value: any) {
    let actual = this.get(key);
    if (!actual) {
      actual = {};
    }
    return this.set(key, Object.assign(actual, value));
  }

  remove(key: string) {
    this.storage.removeItem(key);
  }

  clear() {
    this.storage.clear();
  }

  getUser() {
    return this.get('me') || {};
  }

  setUser(user: User) {
    this.set('me', Object.assign(this.getUser(), user));
    return true;
  }

  getConfig() {
    return this.get('config') || {};
  }

  setConfig(config: Config) {
    this.set('config', Object.assign(this.getConfig(), config));
    return true;
  }
}
