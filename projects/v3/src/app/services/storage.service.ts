import { Inject, Injectable, InjectionToken } from '@angular/core';

interface LastVisited {
  [key: string]: string | number | number[];
}
const BOOKMARK_LIMIT = 1; // Limit the number of bookmarks to store

export const BROWSER_STORAGE = new InjectionToken<Storage>('Browser Storage', {
  providedIn: 'root',
  factory: () => localStorage
});

export interface User {
  uuid?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string; // user avatar pic
  apikey?: string;
  contactNumber?: string;
  email?: string;
  role?: string; // mentor, participant
  image?: string;
  programId?: number;
  programName?: string;
  programImage?: string;
  experienceId?: number;
  institutionLogo?: string;
  institutionName?: string;
  timelineId?: number;
  projectId?: number;
  teamId?: number;
  teamName?: string;
  userHash?: string;
  colors?: Colors;
  activityCardImage?: string; // default activity card image
  hasReviewRating?: boolean;
  truncateDescription?: boolean;
  enrolment?: any;
  activityCompleteMessage?: string;
  chatEnabled?: boolean;
  hasEvents?: boolean;
  hasReviews?: boolean;
  LtiReturnUrl?: string;
  squareLogo?: string; // for collapsed sidemenu
  app_locale?: string;

  lastVisited?: {
    // we handle nested assessment component differently, url may not reflect the focused/active assessment
    assessmentUrl: string;  // last visited assessment url
    url: string; // last visited url (non-assessment)
    activityId: number; // last visited activity id
    homeBookmarks: number[]; // last visited home bookmarks (activity ids)
  },

  // error handling
  saveAssessmentErrors?: [],
}

export interface Referrer {
  // redirect user to this url when
  // 1. user click back button of <route> page
  // 2. user clicks any other "navigate away" button on that page
  route: string;
  url: string;
}

// colors (custom branding)
export interface Colors {
  theme?: string;
  primary?: string;
  secondary?: string;
}

export interface Config {
  logo?: string;
  colors?: Colors;
}

@Injectable({
  providedIn: 'root'
})

export class BrowserStorageService {
  constructor(@Inject(BROWSER_STORAGE) public storage: Storage) { }

  get(key: string) {
    const cached = this.storage.getItem(key);
    if (cached) {
      return JSON.parse(this.storage.getItem(key) || null);
    }
    return null;
  }

  /**
   * set cache into localStorage
   *
   * @param   {string}  key    index for identify a value later
   *    - directLinkRoute: string
   *    - fastFeedbackOpening: boolean (flag to indicate if there is existing fast feedback modal opened)
   *    - authToken: string
   *    - hasMultipleStacks: boolean
   *    - experience: Experience
   *    - tutorial: any
   *    - unRegisteredDirectLink: boolean
   *
   * @param   {any}     value
   *
   * @return  {any}
   */
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

  /**
   * Retrieves the status of a specified feature toggle. (controlled by the backend)
   *
   * @param name - The name of the feature toggle to check. Currently supports 'pulseCheckIndicator'.
   * @returns A boolean indicating whether the specified feature toggle is enabled.
   */
  getFeature(name: 'pulseCheckIndicator'): boolean {
    return this.get('experience')?.featureToggle?.[name] || false;
  }

  getReferrer() {
    return this.get('referrer') || {};
  }

  setReferrer(referrer: Referrer) {
    this.set('referrer', { ...this.getReferrer(), ...referrer });
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

  /**
   * get/set last visited url/activityId/assessmentUrl
   *
   * @param   {string}  name   index for identify a value later
   * @param   {string | number}  value
   *
   * @return  {string | number}
   */
  lastVisited(
    name: 'assessmentUrl' | 'url' | 'activityId' | 'homeBookmarks',
    value?: string | number
  ): string | number | number[] | null {
    let lastVisited: LastVisited = this.get('lastVisited') || {};

    if (value !== undefined) {
      if (name === "homeBookmarks" && typeof value === "number") {
        let bookmarks = (lastVisited["homeBookmarks"] as number[]) || [];

        // Remove existing occurrences of value
        bookmarks = bookmarks.filter((item) => item !== value);

        // Add value to the end
        bookmarks.push(value);

        // Limit bookmarks to BOOKMARK_LIMIT in FIFO order
        if (bookmarks.length > BOOKMARK_LIMIT) {
          bookmarks = bookmarks.slice(-BOOKMARK_LIMIT);
        }

        // Update lastVisited
        lastVisited = {
          ...lastVisited,
          activityId: value,
          [name]: bookmarks,
        };
      } else if (name === "activityId" && typeof value === "number") {
        if (lastVisited["activityId"] === value) {
          // Remove the activityId if it exists and is the same
          delete lastVisited["activityId"];
        } else {
          // Update the activityId with the new value
          lastVisited = { ...lastVisited, [name]: value };
        }
      } else {
        lastVisited = { ...lastVisited, [name]: value };
      }

      this.append("lastVisited", lastVisited);
    }

    return lastVisited[name] || null;
  }

  // clear cache by the storage index name
  clearByName(name: string) {
    const storages = localStorage;
    const result: { [key: string]: any } = {};

    for (let i = 0; i < storages.length; i++) {
      const key = storages.key(i);
      try {
        if (key && key.includes(name)) {
          result[key] = storages.removeItem(key);
        }
      } catch (error) {
        console.error(`Error removing key: ${key}`, error);
      }
    }

    return result;
  }
}
