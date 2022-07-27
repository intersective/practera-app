import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { Platform } from '@ionic/angular';
import { ApolloService } from '@v3/services/apollo.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Colors } from './storage.service';

export enum ThemeColor {
  primary = 'primary',
  secondary = 'secondary',
}

// @TODO: enhance Window reference later, we shouldn't refer directly to browser's window object like this
declare var window: any;

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  private lodash;
  // this Subject is used to broadcast an event to the app
  protected _eventsSubject = new Subject<{ key: string, value: any }>();
  // -- Not in used anymore, leave them commented in case we need later --
  // // this Subject is used in project.service to cache the project data
  // public projectSubject = new BehaviorSubject(null);
  // // this Subject is used in activity.service to cache the activity data
  // // it stores key => Subject pairs of all activities
  // public activitySubjects = {};

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private platform: Platform,
    private apolloService: ApolloService
  ) {
    if (_) {
      this.lodash = _;
    } else {
      throw new Error('Lodash not available');
    }
  }

  /**
   * @name isMobile
   * @description grouping device type into 2 group (mobile/desktop) and return true if mobile, otherwise return false
   * @example https://github.com/ionic-team/ionic/blob/master/angular/src/providers/platform.ts#L71-L115
   */
  isMobile() {
    return window.innerWidth <= 576;
  }

  /** check if a value is empty
   * precautions:
   *  - Lodash's isEmpty, by default, sees "number" type value as empty,
   *    but in our case, we just treat null/undefined/""/[]/{} as empty.
   *  - [{}] = true
   *  - [{}, {}, {}] = false
   *
   * @param  {any}     value
   * @return {boolean}       true: when empty string/object/array, otherwise false
   */
  isEmpty(value: any): boolean {
    // number type value shouldn't be treat as empty
    if (typeof value === 'number') {
      return false;
    }

    return this.lodash.isEmpty(value);
  }

  each(collections, callback) {
    return this.lodash.each(collections, callback);
  }

  unset(object, path) {
    return this.lodash.unset(object, path);
  }

  find(collections, callback) {
    return this.lodash.find(collections, callback);
  }

  findIndex(collections: any[], callback: any) {
    return this.lodash.findIndex(collections, callback);
  }

  has(object, path) {
    return this.lodash.has(object, path);
  }

  flatten(array) {
    return this.lodash.flatten(array);
  }

  indexOf(array, value, fromIndex = 0) {
    return this.lodash.indexOf(array, value, fromIndex);
  }

  remove(collections, callback) {
    return this.lodash.remove(collections, callback);
  }

  openUrl(url, options?: { target: String }) {
    options = options || { target: '_self' };
    return window.open(url, options.target);
  }

  // given an array and a value, check if this value is in this array, if it is, remove it, if not, add it to the array
  addOrRemove(array: Array<any>, value) {
    const position = this.indexOf(array, value);
    if (position > -1) {
      // find the position of this value and remove it
      array.splice(position, 1);
    } else {
      // add it to the value array
      array.push(value);
    }
    return array;
  }

  /**
   * Given query in GraphQL format, change it to the normal query body string
   * i.e. remove the new line and additional spaces
   * @param query the query string
   */
  graphQLQueryStringFormatter(query: string) {
    return query.replace(/(\r\n|\n|\r) */gm, ' ');
  }

  /**
   * accept multiple colors for customized setting,
   * if both "primary" & "theme" colors are provided, only "primary" is accepted
   * if both "primary" & "secondary" provided, both colors will be reflected
   * according to ionic's application of the primary/secondary color in the theme
   *
   * @param   {Colors}  colors accept colors
   * @return  {void}
   */
  changeThemeColor(colors?: Colors): void {
    const defaultColor = '#2bbfd4';
    if (colors) {
      if (colors.primary || colors.theme) {
        this.setColor(colors.primary || colors.theme, ThemeColor.primary);
      } else {
        this.setColor(defaultColor, ThemeColor.primary);
      }

      if (colors.secondary) {
        this.setColor(colors.secondary, ThemeColor.secondary);
      }
    } else {
      this.setColor(defaultColor, ThemeColor.primary);
    }
  }

  /**
   * set color according to provided type (refer ThemeColor enum)
   *
   * @param   {string}      color  color code value
   * @param   {ThemeColor}  type   refer to ThemeColor enum
   *
   * @return  {void}               action happen in the framework level
   */
  setColor(color: string, type: ThemeColor): void {
    this.document.documentElement.style.setProperty(`--ion-color-${type}`, color);
    this.document.documentElement.style.setProperty(`--ion-color-${type}-shade`, color);
    // get the tint version of the color(20% opacity)
    this.document.documentElement.style.setProperty(`--ion-color-${type}-tint`, color + '33');

    // convert hex color to rgb and update css variable
    const hex = color.replace('#', '');
    const red = parseInt(hex.substring(0, 2), 16);
    const green = parseInt(hex.substring(2, 4), 16);
    const blue = parseInt(hex.substring(4, 6), 16);

    this.document.documentElement.style.setProperty(`--ion-color-${type}-rgb`, `${red}, ${green}, ${blue}`);
  }

  changeCardBackgroundImage(image) {
    this.document.documentElement.style.setProperty('--practera-card-background-image', 'url(\'' + image + '\')');
  }

  // broadcast the event to whoever subscribed
  broadcastEvent(key: string, value: any) {
    this._eventsSubject.next({ key, value });
  }

  // get Event to subscribe to
  getEvent(key: string): Observable<any> {
    return this._eventsSubject.asObservable()
      .pipe(
        filter(e => e.key === key),
        map(e => e.value)
      );
  }

  // // get the activity Subject for cache
  // getActivityCache(key): BehaviorSubject<any> {
  //   if (!(key in this.activitySubjects)) {
  //     this.activitySubjects[key] = new BehaviorSubject(null);
  //   }
  //   return this.activitySubjects[key];
  // }

  // // update the activity cache for given key(activity id)
  // updateActivityCache(key, value) {
  //   if (!(key in this.activitySubjects)) {
  //     this.activitySubjects[key] = new BehaviorSubject(null);
  //   }
  //   this.activitySubjects[key].next(value);
  // }

  // need to clear all Subject for cache
  async clearCache(): Promise<void> {
    const apolloClient = this.apolloService.getClient();
    // clear cache before initialised
    if (apolloClient) {
      apolloClient.stop();
      await apolloClient.clearStore();
    }
    //   // initialise the Subject for caches
    //   this.projectSubject.next(null);
    //   this.each(this.activitySubjects, (subject, key) => {
    //     this.activitySubjects[key].next(null);
    //   });
  }


  // transfer url query string to an object
  urlQueryToObject(query: string) {
    return JSON.parse('{"' + decodeURI(query).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
  }


  /**
   * This is a time formatter that transfer time/date string to a nice string
   * It will return different string based on the comparision with 'compareWith' (default is today)
   * Any time before yesterday(one day before 'compareWith') will return 'Yesterday'
   * Any time today(the same day as 'compareWith') will return the time
   * Any other time will just return the date in "3 May" format
   * @param {Date} time        [The time string going to be formatted (In UTC timezone)]
   * @param {Date} compareWith [The time string used to compare with]
   */
  timeFormatter(time: Date | string, compareWith?: Date | string): string {
    if (!time) {
      return '';
    }
    const date = moment(new Date(this.iso8601Formatter(time)));
    // if no compareWith provided, compare with today
    // and create tomorrow and yesterday from it.
    const compareDate = moment((compareWith) ? new Date(this.iso8601Formatter(compareWith)) : new Date());
    const tomorrow = compareDate.clone().add(1, 'day').startOf('day');
    const yesterday = compareDate.clone().subtract(1, 'day').startOf('day');

    if (date.isSame(yesterday, 'd')) {
      return 'Yesterday';
    }
    if (date.isSame(tomorrow, 'd')) {
      return 'Tomorrow';
    }
    if (date.isSame(compareDate, 'd')) {
      return new Intl.DateTimeFormat('en-US', {
        hour12: true,
        hour: 'numeric',
        minute: 'numeric'
      }).format(date.toDate());
    }
    return new Intl.DateTimeFormat('en-GB', {
      month: 'short',
      day: 'numeric'
    }).format(date.toDate());
  }

  /**
   * turn date into customised & human-readable language (non RFC2822/ISO standard)
   * @param {Date | string}    time Date
   * @param {string}       display date: display date, time: display time, all: date + time
   */
  utcToLocal(time: Date | string, display: string = 'all') {
    if (!time) {
      return '';
    }
    const date = new Date(this.iso8601Formatter(time));
    const formattedTime = new Intl.DateTimeFormat('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);

    switch (display) {
      case 'date':
        return this.dateFormatter(date);

      case 'time':
        return formattedTime;

      default:
        return this.dateFormatter(date) + ' ' + formattedTime;
    }
  }

  /**
   * @description turn date into string formatted date
   * @param {Date} date targetted date
   */
  dateFormatter(date: Date): string {
    const dateToFormat = moment(date);
    const today = moment(new Date());
    const tomorrow = today.clone().add(1, 'day').startOf('day');
    const yesterday = today.clone().subtract(1, 'day').startOf('day');

    if (dateToFormat.isSame(yesterday, 'd')) {
      return 'Yesterday';
    }
    if (dateToFormat.isSame(tomorrow, 'd')) {
      return 'Tomorrow';
    }
    if (dateToFormat.isSame(today, 'd')) {
      return 'Today';
    }

    return new Intl.DateTimeFormat('en-GB', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(dateToFormat.toDate());
  }

  /**
   * @description dates comparison (between today/provided date)
   * @param {Date    | string} timeString [description]
   * @param {boolean}            = {}} options [description]
   * @return {number} -1: before, 0: same date, 1: after
   */
  timeComparer(
    timeString: Date | string,
    options: {
      comparedString?: Date | string,
      compareDate?: boolean
    } = {}
  ): number {
    const { comparedString, compareDate } = options;

    const time = new Date(this.iso8601Formatter(timeString));
    let compared = new Date();
    if (comparedString) {
      compared = new Date(this.iso8601Formatter(comparedString));
    }
    if (compareDate && (time.getDate() === compared.getDate() &&
      time.getMonth() === compared.getMonth() &&
      time.getFullYear() === compared.getFullYear())) {
      return 0;
    }
    if (time.getTime() < compared.getTime()) {
      return -1;
    }
    if (time.getTime() === compared.getTime()) {
      return 0;
    }
    if (time.getTime() > compared.getTime()) {
      return 1;
    }
  }

  /**
   * get next element in an array,
   * return undefined if the next value is not available
   */
  getNextArrayElement(target: any[], currentId: number): any {
    const length = target.length;
    const index = target.findIndex(datum => {
      return datum.id === currentId;
    });

    const nextElement = target[index + 1];

    return target[index + 1];
  }

  /**
   * check if the targeted element in an array is located at the last in the last index
   */
  checkOrderById(target: any[], currentId, options: {
    isLast: boolean;
  }): boolean {
    const length = target.length;
    const index = target.findIndex(datum => {
      return datum.id === currentId;
    });

    return (length - 1) === index;
  }
  /**
   * Format the time string
   * 1. Add 'T' between date and time, for compatibility with Safari
   * 2. Add 'Z' at last to indicate that it is UTC time, browser will automatically convert the time to local time
   *
   * Example time string: '2019-08-06 15:03:00'
   * After formatter: '2019-08-06T15:03:00Z'
   *
   * SAFARI enforce ISO 8601 (no space as time delimiter allowed)
   * T for time delimiter
   * Z for timezone (UTC) delimiter (+0000)
   */
  iso8601Formatter(time: Date | string) {
    try {
      if (typeof time === 'string') {
        let tmpTime = time;
        if (!time.includes('GMT') && !(time.toLowerCase()).includes('z')) {
          tmpTime += ' GMT+0000';
        }
        return (new Date(tmpTime)).toISOString();
      }
      return time.toISOString();
    } catch (err) {
      // in case the above doesn't work on Safari
      if (typeof time === 'string') {
        // add "T" between date and time, so that it works on Safari
        time = time.replace(' ', 'T');
        // add "Z" to indicate that it is UTC time, it will automatically convert to local time
        return time + 'Z';
      }
      return time.toISOString();
    }
  }

  redirectToUrl(url: string) {
    window.location.href = `${url.match(/^https*:\/\//) ? '' : 'https://'}${url}`;
  }

  /**
   * generate secure and totally randomised number
   * @return {number} single random number
   */
  randomNumber(): number {
    const { crypto } = window;
    const slugs = crypto.getRandomValues(new Uint32Array(1));
    return slugs[0];
  }

  /**
   * Given a domain and endpoint string, return a correctly formatted url string
   * e.g.
   * test.practera.com - login => https://test.practera.com/login
   *
   */
  urlFormatter(domain: string, endpoint?: string) {
    // always need http as prefix
    let theDomain = !domain.match(/^http/) ? `https://${domain}` : domain;
    // remove / in suffix
    theDomain = theDomain.replace(/\/$/, '');
    if (!endpoint) {
      return theDomain;
    }
    // always have / in prefix
    let theEndpoint = !endpoint.match(/^\//) ? `/${endpoint}` : endpoint;
    // remove / in suffix
    theEndpoint = theEndpoint.replace(/\/$/, '');
    return `${theDomain}${theEndpoint}`;
  }

  /* extra query parameters from URL (window.location)
   *
   * @return  {URLSearchParams}
   */
  getQueryParams(): URLSearchParams {
    let queryString = '';
    if (window.location.search) {
      queryString = window.location.search.substring(1);
    } else if (window.location.hash) {
      queryString = window.location.hash.substring(2);
    } else if (window.location.href.includes(';')) {
      const url = window.location.href;
      window.location.href = url.replace(/;/, '?').replace(/;/g, '&');
    }
    return new URLSearchParams(queryString);
  }

  /**
   * This method check due dates of assessment or activity.
   * - Check due date is today, tomorrow, upcoming date or overdue date.
   * - If due date is upcoming one this will returns 'Due (date)' ex: 'Due 06-30-2019'.
   * - If due date is overdue one this will returns 'Overdue (date)' ex: 'Overdue 01-10-2019'.
   * - If due date is today this will return 'Due Today'.
   * - If due date is tomorrow this will return 'Due Tomorrow'.
   * @param dueDate - due date of assessment or activity.
   */
  dueDateFormatter(dueDate: string) {
    if (!dueDate) {
      return '';
    }
    const difference = this.timeComparer(dueDate);
    if (difference < 0) {
      return 'Overdue ' + this.utcToLocal(dueDate);
    }
    return 'Due ' + this.utcToLocal(dueDate);
  }

  getDateDifference(dateOne: string, datetwo: string) {
    const dt1 = new Date(this.iso8601Formatter(dateOne));
    const dt2 = new Date(this.iso8601Formatter(datetwo));
    const diff = Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate());
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  getFutureDated(date: string, dayCount: number) {
    const currentDate = moment(this.iso8601Formatter(date));
    return currentDate.clone().add(dayCount, 'day').format('YYYY-MM-DD hh:mm:ss');
  }

  downloadFile(path: string) {
    // Create a new link
    const anchor = document.createElement('a');
    anchor.href = path;
    anchor.download = 'download';
    anchor.target = "_blank";

    // Append to the DOM
    document.body.appendChild(anchor);

    // Trigger `click` event
    anchor.click();

    // Remove element from DOM
    document.body.removeChild(anchor);
  }

  /**
   *
   * @returns time that formated to 12 hours
   */
  getFormatedCurrentTime() {
    return new Intl.DateTimeFormat('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: 'numeric'
    }).format(new Date());
  }
}
