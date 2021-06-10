import * as moment from 'moment';
import * as _ from 'lodash';
import { UtilsService } from '@services/utils.service';

export class SpyObject {
  constructor(type?: any) {
    if (type) {
      for (const prop in type.prototype) {
        if (prop) {
          let m: any = null;
          try {
            m = type.prototype[prop];
          } catch (e) {
            // As we are creating spys for abstract classes,
            // these classes might have getters that throw when they are accessed.
            // As we are only auto creating spys for methods, this
            // should not matter.
          }
          if (typeof m === 'function') {
            this.spy(prop);
          }
        }
      }
    }
  }

  spy(name: string) {
    if (!(this as any)[name]) {
      (this as any)[name] = jasmine.createSpy(name);
    }
    return (this as any)[name];
  }

  prop(name: string, value: any) { (this as any)[name] = value; }

}

export class TestUtils extends SpyObject {
  isEmpty;
  isMobile;
  clearCache;
  find;

  constructor() {
    super(UtilsService);
    this.isEmpty = this.spy('isEmpty');
    this.isMobile = this.spy('isMobile');
    this.find = this.spy('find');
    this.clearCache = this.spy('clearCache').and.returnValue(true);
  }

  static createRouterSpy() {
    return {
      navigate: jasmine.createSpy('navigate'),
    };
  }

  /**
   * Get a date string
   * @param day  number of dates after today. if < 0, is number of days before today
   * @param minute number of minutes after the current minute. if < 0, is number of minutes before current minute
   *
   * e.g.
   * getDateString(1, 0) returns tomorrow at the same time
   * getDateString(-1, 0) returns yesterday at the same time
   * getDateString(0, 1) returns today at one minute later
   * @return {string} UTC date string
   */
  getDateString(day: number, minute: number): string {
    const momentDate = `${moment.utc().add(day, 'days').add(minute, 'minute').format('YYYY-MM-DD hh:mm:ss')}`;
    return momentDate;
  }

  /**
   * add '0' before the number if it is less than 10
   * @param number the number for checking
   */
  numberFormatter(number: number) {
    return number < 10 ? '0' + number : number;
  }
}
