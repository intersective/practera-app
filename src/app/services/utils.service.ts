import { Injectable, Inject } from '@angular/core';
import * as _ from 'lodash';
import { DOCUMENT } from '@angular/common';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { Platform } from '@ionic/angular';
import * as moment from 'moment';

// @TODO: enhance Window reference later, we shouldn't refer directly to browser's window object like this
declare var window: any;

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  private lodash;
  // this Subject is used to broadcast an event to the app
  protected _eventsSubject = new Subject<{key: string, value: any}>();
  // this Subject is used in project.service to cache the project data
  public projectSubject = new BehaviorSubject(null);
  // this Subject is used in activity.service to cache the activity data
  // it stores key => Subject pairs of all activities
  public activitySubjects = {};

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private platform: Platform
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

  indexOf(array, value, fromIndex= 0) {
    return this.lodash.indexOf(array, value, fromIndex);
  }

  remove(collections, callback) {
    return this.lodash.remove(collections, callback);
  }

  openUrl(url, options?: { target: String }) {
    options = options || {target: '_self' };
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

  changeThemeColor(color): void {
    this.document.documentElement.style.setProperty('--ion-color-primary', color);
    this.document.documentElement.style.setProperty('--ion-color-primary-shade', color);
    // get the tint version of the color(20% opacity)
    this.document.documentElement.style.setProperty('--ion-color-primary-tint', color + '33');
    // convert hex color to rgb and update css variable
    const hex = color.replace('#', '');
    const red = parseInt(hex.substring(0, 2), 16);
    const green = parseInt(hex.substring(2, 4), 16);
    const blue = parseInt(hex.substring(4, 6), 16);

    this.document.documentElement.style.setProperty('--ion-color-primary-rgb', red + ',' + green + ',' + blue);
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

  // get the activity Subject for cache
  getActivityCache(key): BehaviorSubject<any> {
    if (!(key in this.activitySubjects)) {
      this.activitySubjects[key] = new BehaviorSubject(null);
    }
    return this.activitySubjects[key];
  }

  // update the activity cache for given key(activity id)
  updateActivityCache(key, value) {
    if (!(key in this.activitySubjects)) {
      this.activitySubjects[key] = new BehaviorSubject(null);
    }
    this.activitySubjects[key].next(value);
  }

  // need to clear all Subject for cache
  clearCache() {
    // initialise the Subject for caches
    this.projectSubject.next(null);
    this.each(this.activitySubjects, (subject, key) => {
      this.activitySubjects[key].next(null);
    });
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
      return new Intl.DateTimeFormat('en-GB', {
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
    const formattedTime = new Intl.DateTimeFormat('en-GB', {
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
}
