import { Injectable, Inject } from '@angular/core';
import * as _ from 'lodash';
import { DOCUMENT } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { map, filter } from 'rxjs/operators';

// @TODO: enhance Window reference later, we shouldn't refer directly to browser's window object like this
declare var window: any;

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  private lodash;
  protected _eventsSubject = new Subject<{key: string, value: any}>();

  constructor(
    @Inject(DOCUMENT) private document: Document,
  ) {
    if (_) {
      this.lodash = _;
    } else {
      throw new Error('Lodash not available');
    }
  }

  isEmpty(value: any): boolean {
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

  changeThemeColor(color) {
    this.document.documentElement.style.setProperty('--ion-color-primary', color);
    this.document.documentElement.style.setProperty('--ion-color-primary-shade', color);
    this.document.documentElement.style.setProperty('--ion-color-primary-tint', color);
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
   * @param {string} time        [The time string going to be formatted (In UTC timezone)]
   * @param {string} compareWith [The time string used to compare with]
   */
  timeFormatter(time: string, compareWith?: string) {
    if (!time) {
      return '';
    }
    // if no compareWith provided, compare with today
    let compareDate = new Date();
    if (compareWith) {
      compareDate = new Date(this.timeStringFormatter(compareWith));
    }
    const date = new Date(this.timeStringFormatter(time));
    if (date.getFullYear() === compareDate.getFullYear() && date.getMonth() === compareDate.getMonth()) {
      if (date.getDate() === compareDate.getDate() - 1) {
        return 'Yesterday';
      }
      if (date.getDate() === compareDate.getDate() + 1) {
        return 'Tomorrow';
      }
      if (date.getDate() === compareDate.getDate()) {
        return new Intl.DateTimeFormat('en-GB', {
          hour12: true,
          hour: 'numeric',
          minute: 'numeric'
        }).format(date);
      }
    }
    return new Intl.DateTimeFormat('en-GB', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  utcToLocal(time: string, display: string = 'all') {
    if (!time) {
      return '';
    }
    const date = new Date(this.timeStringFormatter(time));
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

  dateFormatter(date: Date) {
    const today = new Date();
    let formattedDate = new Intl.DateTimeFormat('en-GB', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);

    if (date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth()) {
      if (date.getDate() === today.getDate() - 1) {
        formattedDate = 'Yesterday';
      }
      if (date.getDate() === today.getDate()) {
        formattedDate = 'Today';
      }
      if (date.getDate() === today.getDate() + 1) {
        formattedDate = 'Tomorrow';
      }
    }
    return formattedDate;
  }

  timeComparer(timeString: string, comparedString?: string, compareDate?: boolean) {
    const time = new Date(this.timeStringFormatter(timeString));
    let compared = new Date();
    if (comparedString) {
      compared = new Date(this.timeStringFormatter(comparedString));
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
   */
  timeStringFormatter(time: string) {
    // add "T" between date and time, so that it works on Safari
    time = time.replace(' ', 'T');
    // add "Z" to indicate that it is UTC time, it will automatically convert to local time
    return time + 'Z';
  }
}
