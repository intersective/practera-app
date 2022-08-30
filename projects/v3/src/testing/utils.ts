import * as moment from 'moment';
import { UtilsService } from '@v3/services/utils.service';
import * as _ from 'lodash';
import { of, Subject } from 'rxjs';

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
  lodash;
  isMobile;
  clearCache;
  each;
  find;
  indexOf;
  getEvent;
  broadcastEvent;
  redirectToUrl;
  urlFormatter;
  timeComparer;
  iso8601Formatter;
  utcToLocal;
  randomNumber;
  addOrRemove;
  timeFormatter;
  dateFormatter;
  dueDateFormatter;
  changeThemeColor;
  getDateDifference;
  changeCardBackgroundImage;
  getFutureDated;

  protected _eventsSubject = new Subject<{ key: string, value: any }>();

  constructor() {
    super(UtilsService);
    this.lodash = _;
    // UtilsService.prototype['lodash'] = (UtilsService.prototype['lodash']) ? UtilsService.prototype['lodash'] : _;
    // this.isEmpty = this.spy('isEmpty').and.callFake(UtilsService.prototype.isEmpty);
    this.isMobile = this.spy('isMobile');
    this.each = this.spy('each').and.callFake(UtilsService.prototype.each);
    this.find = this.spy('find');
    this.indexOf = this.spy('indexOf').and.callFake(UtilsService.prototype.indexOf);
    this.broadcastEvent = this.spy('broadcastEvent').and.callFake(UtilsService.prototype.broadcastEvent);
    this.getEvent = this.spy('getEvent').and.callFake(UtilsService.prototype.getEvent);
    this.broadcastEvent = this.spy('broadcastEvent');
    this.redirectToUrl = this.spy('redirectToUrl')/* .and.callFake(UtilsService.prototype.redirectToUrl) */;
    this.urlFormatter = this.spy('urlFormatter').and.callFake(UtilsService.prototype.urlFormatter);
    this.timeComparer = this.spy('timeComparer').and.callFake(UtilsService.prototype.timeComparer);
    this.iso8601Formatter = this.spy('iso8601Formatter').and.callFake(UtilsService.prototype.iso8601Formatter);
    this.utcToLocal = this.spy('utcToLocal').and.callFake(UtilsService.prototype.utcToLocal);
    this.randomNumber = this.spy('randomNumber').and.callFake(UtilsService.prototype.randomNumber);
    this.timeFormatter = this.spy('timeFormatter').and.callFake(UtilsService.prototype.timeFormatter);
    this.dateFormatter = this.spy('dateFormatter').and.callFake(UtilsService.prototype.dateFormatter);
    this.dueDateFormatter = this.spy('dueDateFormatter').and.callFake(UtilsService.prototype.dueDateFormatter);
    this.addOrRemove = this.spy('addOrRemove').and.callFake(UtilsService.prototype.addOrRemove);
    this.getDateDifference = this.spy('getDateDifference').and.callFake(UtilsService.prototype.getDateDifference);
    this.clearCache = this.spy('clearCache').and.returnValue(true);
    this.changeThemeColor = this.spy('changeThemeColor').and.returnValue(true);
    this.changeCardBackgroundImage = this.spy('changeCardBackgroundImage').and.returnValue(true);
    this.getFutureDated = this.spy('getFutureDated').and.callFake(UtilsService.prototype.getFutureDated);
  }

  static createRouterSpy() {
    return {
      navigate: jasmine.createSpy('navigate'),
    };
  }

  isEmpty(value: any): boolean {
    // number type value shouldn't be treat as empty
    if (typeof value === 'number') {
      return false;
    }

    return this.lodash.isEmpty(value);
  }

  has(object, path) {
    return _.has(object, path);
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
