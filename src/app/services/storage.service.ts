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
  programImage?: string;
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
  enrolment?: any;
  activityCompleteMessage?: string;
  chatEnabled?: boolean;
  hasEvents?: boolean;
  hasReviews?: boolean;
  LtiReturnUrl?: string;
}

export interface Referrer {
  // redirect user to this url when
  // 1. user click back button of <route> page
  // 2. user clicks any other "navigate away" button on that page
  route: string;
  url: string;
}

export interface Config {
  logo?: string;
  color?: string;
}

export interface S3Config {
  container: string;
  region: string;
  paths: {
    any: string;
    image: string;
    video: string;
  };
}
export interface FilestackConfig {
  s3Config: S3Config;
}

export interface Stack {
  uuid: string;
  name: string;
  description: string;
  image: string;
  url: string;
  type: string;
  coreApi: string;
  coreGraphQLApi: string;
  chatApi: string;
  filestack: FilestackConfig;
  defaultCountryModel: string;
  lastLogin: number;
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

  getUser(): User {
    return this.get('me') || {};
  }

  setUser(user: User) {
    this.set('me', Object.assign(this.getUser(), user));
    return true;
  }

  getReferrer() {
    return this.get('referrer') || {};
  }

  setReferrer(referrer: Referrer) {
    this.set('referrer', {...this.getReferrer(), ...referrer});
    return true;
  }

  getConfig() {
    return this.get('config') || {};
  }

  setConfig(config: Config) {
    this.set('config', Object.assign(this.getConfig(), config));
    return true;
  }
  /*********
    'bookedEventActivityIds' records the single booking activity ids that event has been booked for current user
  **********/
  // get the list of activity ids in local storage to check whether we need to show the single booking pop up or not
  getBookedEventActivityIds(): Array<number> {
    return this.get('bookedEventActivityIds') || [];
  }

  // 1. set this value when we get events data from API
  // 2. record the activity id when user book an event
  setBookedEventActivityIds(id: number): void {
    const ids = this.getBookedEventActivityIds();
    ids.push(id);
    this.set('bookedEventActivityIds', ids);
  }

  // remove the activity id when user cancel booking
  removeBookedEventActivityIds(id: number): void {
    const ids = this.getBookedEventActivityIds();
    const index = ids.indexOf(id);
    if (index < 0) {
      return;
    }
    ids.splice(index, 1);
    this.set('bookedEventActivityIds', ids);
    return;
  }

  // remove this cache from local storage
  initBookedEventActivityIds(): void {
    this.remove('bookedEventActivityIds');
  }

  setCountry(country: string) {
    this.set('country', country);
  }

  getCountry() {
    return this.get('country');
  }

  setCurrentChatChannel(channel) {
    this.set('chatChannel', channel);
  }

  getCurrentChatChannel() {
    return this.get('chatChannel');
  }

  get singlePageAccess() {
    const result = this.get('singlePageAccess');
    return result || false;
  }

  set singlePageAccess(val) {
    this.set('singlePageAccess', val);
  }

  get stackConfig() {
    const result = this.get('stackConfig');
    return result || false;
  }

  set stackConfig(val: Stack) {
    this.set('stackConfig', val);
  }

  // methods to store and get stacks that user have access.
  get stacks() {
    const result = this.get('stacks');
    return result || false;
  }

  set stacks(val: Array<Stack>) {
    this.set('stacks', val);
  }

  // methods to store and get apikey that login API return after login.
  get loginApiKey() {
    const result = this.get('loginApiKey');
    return result || false;
  }

  set loginApiKey(val: string) {
    this.set('loginApiKey', val);
  }
}
