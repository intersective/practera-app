import { Injectable, Inject } from '@angular/core';
import * as _ from 'lodash';
import { DOCUMENT } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { map, filter } from 'rxjs/operators';

// @TODO: enhance Window reference later, we shouldn't refer directly to browser's window object like this
declare var window: any;

// contact number format should be consistent throughout the app (GoMobile & Setting)
export class ContactNumberFormat {
  masks = {
    AUS: ['+', '6', '1', ' ', /[1-9]/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/],
    US: ['+', '1', ' ', /[1-9]/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/],
  };

  // supported countries
  countryCodes = [
    {
      name: 'Australia',
      code: 'AUS',
      format: '+61 ___ ___ ___'
    },
    {
      name: 'US/Canada',
      code: 'US',
      format: '+1 ___ ___ ____'
    },
  ];
}

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

  indexOf(array, value, fromIndex= 0) {
    return this.lodash.indexOf(array, value, fromIndex);
  }

  remove(collections, callback) {
    return this.lodash.remove(collections, callback);
  }

  openUrl(url, options?: {target: '_self'}) {
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
      compareWith = compareWith.replace(' ', 'T');
      compareDate = new Date(compareWith + 'Z');
    }
    // add "T" between date and time, so that it works on Safari
    time = time.replace(' ', 'T');
    // add "Z" to declare that it is UTC time, it will automatically convert to local time
    const date = new Date(time + 'Z');
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
    // add "T" between date and time, so that it works on Safari
    time = time.replace(' ', 'T');
    // add "Z" to declare that it is UTC time, it will automatically convert to local time
    const date = new Date(time + 'Z');
    switch (display) {
      case 'date':
        const today = new Date();
        if (date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth()) {
          if (date.getDate() === today.getDate() - 1) {
            return 'Yesterday';
          }
          if (date.getDate() === today.getDate()) {
            return 'Today';
          }
          if (date.getDate() === today.getDate() + 1) {
            return 'Tomorrow';
          }
        }
        return new Intl.DateTimeFormat('en-GB', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }).format(date);

      case 'time':
        return new Intl.DateTimeFormat('en-GB', {
          hour12: true,
          hour: 'numeric',
          minute: 'numeric'
        }).format(date);

      default:
        return new Intl.DateTimeFormat('en-GB', {
          hour12: true,
          hour: 'numeric',
          minute: 'numeric',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }).format(date);
    }
  }

  timeComparer(timeString: string, comparedString?: string) {
    const time = new Date(timeString + 'Z');
    let compared = new Date();
    if (comparedString) {
      compared = new Date(comparedString + 'Z');
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
   * This method check due dates of assessment or activity.
   * - Check due date is today, tomorrow, upcoming date or overdue date.
   * - If due date is upcoming one this will returns 'Due (date)' ex: 'Due 06-30-2019'.
   * - If due date is overdue one this will returns 'Overdue (date)' ex: 'Overdue 01-10-2019'.
   * - If due date is today this will return 'Due Today'.
   * - If due date is tomorrow this will return 'Due Tomorrow'.
   * @param dueDate - due date of assessment or activity.
   */
  validateDueDates(dueDate: string) {
    const difference = this.comparerDate(dueDate);
    if (difference === 0) {
      return 'Due Today';
    }
    if (difference === -1) {
      return 'Due Tomorrow';
    }
    if (difference < -1) {
      return 'Due ' + new Intl.DateTimeFormat('en-GB', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      }).format(new Date(dueDate + 'Z'));
    }
    if (difference > 0) {
      return 'Overdue ' + new Intl.DateTimeFormat('en-GB', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      }).format(new Date(dueDate + 'Z'));
    }
  }

  /**
   * This method comparing any two dates and return difference in days.
   * @param dateString date need to compare
   * @param comparedDateString comparing date (optinal) if didn't get value default value is today.
   */
  comparerDate(dateString: string, comparedDateString?: string) {
    const date = new Date(dateString + 'Z');
    let comparedDate = new Date();
    if (comparedDateString) {
      comparedDate = new Date(comparedDateString + 'Z');
    }
    // Calculate the difference and return
    return Math.floor(
      (Date.UTC(comparedDate.getFullYear(), comparedDate.getMonth(), comparedDate.getDate()) -
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) ) / (1000 * 60 * 60 * 24));
  }

}
