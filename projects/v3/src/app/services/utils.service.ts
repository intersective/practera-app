import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import isEmpty from 'lodash-es/isEmpty';
import each from 'lodash-es/each';
import unset from 'lodash-es/unset';
import find from 'lodash-es/find';
import findIndex from 'lodash-es/findIndex';
import has from 'lodash-es/has';
import flatten from 'lodash-es/flatten';
import indexOf from 'lodash-es/indexOf';
import remove from 'lodash-es/remove';
import isEqual from 'lodash-es/isEqual';
import * as dayjs from 'dayjs';
import { Colors, BrowserStorageService } from './storage.service';
import * as convert from 'color-convert';
import { SupportPopupComponent } from '@v3/components/support-popup/support-popup.component';
import { Title } from '@angular/platform-browser';

import Delta from 'quill-delta';

export enum ThemeColor {
  primary = 'primary',
  secondary = 'secondary',
}

// @TODO: enhance Window reference later, we shouldn't refer directly to browser's window object like this
declare const window: Window & typeof globalThis;

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
    private readonly modalController: ModalController,
    private readonly storageService: BrowserStorageService,
    private title: Title
  ) {
    // initialise lodash (reduce bundle size)
    this.lodash = {
      isEmpty,
      each,
      unset,
      find,
      findIndex,
      has,
      flatten,
      indexOf,
      remove,
      isEqual,
    };
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

  flatten(values: any[]) {
    return this.lodash.flatten(values);
  }

  indexOf(values: any[], value, fromIndex = 0) {
    return this.lodash.indexOf(values, value, fromIndex);
  }

  remove(collections, callback) {
    return this.lodash.remove(collections, callback);
  }

  isEqual(value, other) {
    return this.lodash.isEqual(value, other);
  }

  openUrl(url, options?: { target: string }) {
    options = options || { target: '_self' };
    return window.open(url, options.target);
  }

  // given an array and a value, check if this value is in this array, if it is, remove it, if not, add it to the array
  addOrRemove(arrayInput: any[], subject: number | string): any[] {
    if (typeof arrayInput === 'undefined') {
      arrayInput = [];
    }

    const position = this.indexOf(arrayInput, subject);
    if (position > -1) {
      // find the index position of this subject and remove it
      arrayInput.splice(position, 1);
    } else {
      // add it to the subject arrayInput
      arrayInput.push(subject);
    }
    return arrayInput;
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

  getCurrentLocation(): Location {
    return this.document.location;
  }

  // extract locale from URL
  getCurrentLocale(): string {
    const checkings = {
      '/en-US/': 'en-US',
      '/ja/': 'ja',
      '/es/': 'es',
    };
    const curLoc = this.getCurrentLocation();

    let result = null;
    for (const [check, value] of Object.entries(checkings)) {
      if (curLoc?.pathname.indexOf(check) === 0) {
        result = value;
        break;
      }
    }

    // english as default
    return result || 'en-US';
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
    const date = dayjs(new Date(this.iso8601Formatter(time)));
    // if no compareWith provided, compare with today
    // and create tomorrow and yesterday from it.
    const compareDate = dayjs((compareWith) ? new Date(this.iso8601Formatter(compareWith)) : new Date());
    const tomorrow = compareDate.clone().add(1, 'day').startOf('day');
    const yesterday = compareDate.clone().subtract(1, 'day').startOf('day');

    if (date.isSame(yesterday, 'd')) {
      return $localize`Yesterday`;
    }
    if (date.isSame(tomorrow, 'd')) {
      return $localize`Tomorrow`;
    }

    const currentLocale = this.getCurrentLocale();
    // when in English, default to format of "en-GB" from previous code
    const defaultLocale = currentLocale === 'en-US' ? 'en-GB' : currentLocale;

    if (date.isSame(compareDate, 'd')) {
      return new Intl.DateTimeFormat(currentLocale, { // support en-US
        hour12: this.isHour12Format(currentLocale),
        hour: 'numeric',
        minute: 'numeric'
      }).format(date.toDate());
    }
    return new Intl.DateTimeFormat(defaultLocale, { // support en-GB
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

    const currentLocale = this.getCurrentLocale();
    const timeFormat: Intl.DateTimeFormatOptions = {
      hour12: this.isHour12Format(currentLocale),
      hour: 'numeric',
      minute: 'numeric'
    };

    switch (display) {
      case 'date':
        return this.dateFormatter(date);

      case 'time':
        return new Intl.DateTimeFormat(currentLocale, timeFormat).format(date);

      case 'timeZone':
        const formatted = new Intl.DateTimeFormat(currentLocale, timeFormat);
        const resolvedOptions = formatted.resolvedOptions();
        return `${this.dateFormatter(date)} ${formatted.format(date)} (${resolvedOptions.timeZone})`;

      default:
        const formattedTime = new Intl.DateTimeFormat(currentLocale, timeFormat).format(date);
        return this.dateFormatter(date) + ' ' + formattedTime;
    }
  }

  /**
   * @description turn date into string formatted date
   * @param {Date} date targetted date
   */
  dateFormatter(date: Date): string {
    const dateToFormat = dayjs(date);
    const today = dayjs(new Date());
    const tomorrow = today.clone().add(1, 'day').startOf('day');
    const yesterday = today.clone().subtract(1, 'day').startOf('day');

    if (dateToFormat.isSame(yesterday, 'd')) {
      return $localize`Yesterday`;
    }
    if (dateToFormat.isSame(tomorrow, 'd')) {
      return $localize`Tomorrow`;
    }
    if (dateToFormat.isSame(today, 'd')) {
      return $localize`Today`;
    }

    const currentLocale = this.getCurrentLocale();
    // when in English, default to "en-GB" format (from previous code)
    const defaultLocale = currentLocale === 'en-US' ? 'en-GB' : currentLocale;
    return new Intl.DateTimeFormat(defaultLocale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(dateToFormat.toDate());
  }

  /**
   * @description find out the event start earlier/now/later by comparing dates between today with the provided date
   * @param {Date | string} timeString date or time to be compared with
   * @param {boolean} = {}} options    additional options (comparedString: string, compareDate: boolean)
   * @return {number} -1: before, 0: same date, 1: after
   */
  timeComparer(
    timeString: Date | string,
    options: {
      comparedString?: Date | string, // compare with date another than today
      compareDate?: boolean, // compare date only, ignore time
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

    return Math.sign(time.getTime() - compared.getTime());
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
  checkOrderById(target: any[], currentId: number, options: {
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
      let date: Date;

      if (typeof time === 'string') {
        // If the string doesn't include a timezone, assume it's in UTC
        const timeStr = time.includes('GMT') || time.toLowerCase().includes('z') ? time : time + ' GMT+0000';
        date = new Date(timeStr);
      } else {
        date = time;
      }

      return date.toISOString();
    } catch (err) {
      // in case the above doesn't work on Safari
      if (typeof time === 'string') {
        // add "T" between date and time, so that it works on Safari
        const safariTime = time.replace(' ', 'T') + 'Z';
        // add "Z" to indicate that it is UTC time, it will automatically convert to local time
        return new Date(safariTime).toISOString();
      }

      // If the input is a Date & conversion fail, rethrow error
      throw err;
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
   * @param plain - (optional) if true, it will return only formatted date without 'Due' or 'Overdue' prefix.
   */
  dueDateFormatter(dueDate: string, plain?: boolean) {
    if (!dueDate) {
      return '';
    }
    if (plain === true) {
      return this.utcToLocal(dueDate);
    }
    const difference = this.timeComparer(dueDate);
    if (difference < 0) {
      return $localize`Overdue ${this.utcToLocal(dueDate)}`;
    }
    return $localize`Due ${this.utcToLocal(dueDate)}`;
  }

  getDateDifference(dateOne: string, datetwo: string) {
    const dt1 = new Date(this.iso8601Formatter(dateOne));
    const dt2 = new Date(this.iso8601Formatter(datetwo));
    const diff = Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate());
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  getFutureDated(date: string, dayCount: number) {
    const currentDate = dayjs(this.iso8601Formatter(date));
    return currentDate.clone().add(dayCount, 'day').format('YYYY-MM-DD hh:mm:ss');
  }

  /**
   * substract one second from the given date time string
   * Note: this is used especially for allDay event, as the end datetime from API
   *       is 00:00:00 of the next day
   *
   * @param   {string}  dateTimeString datetime string
   *
   * @return  {string}  datetime string with one second substracted
   */
  subtractOneSecond(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    date.setSeconds(date.getSeconds() - 1);
    return date.toISOString();
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
   * Intl.DateTimeFormat() take in locale but hour12 format is not consistent
   * @param locale string - locale
   */
  isHour12Format(locale: string): boolean {
    // code not suitable to cover all locales,
    // but enough for whatever we're supporting now
    return (locale === 'en-GB') ? false : true;  // 24 hours for en-GB
  }

  /**
   *
   * @returns time that formated to 12 hours
   */
  getFormatedCurrentTime() {
    const currentLocale = this.getCurrentLocale();
    return new Intl.DateTimeFormat(this.getCurrentLocale(), {
      hour12: this.isHour12Format(currentLocale),
      hour: 'numeric',
      minute: 'numeric'
    }).format(new Date());
  }

  /**
   * return new p2 roles for the old roles.
   * @param role String - User role
   * @returns String - new user roles.
   */
  getUserRolesForUI(role?: string) {
    switch (role) {
      case 'participant':
        return $localize`:labelling:learner`;
      case 'mentor':
        return $localize`:labelling:expert`;
      case 'admins':
        return $localize`:labelling:admins`;
      case 'admin':
        return $localize`:labelling:admin`;
      case 'sysadmins':
        return $localize`:labelling:sysadmins`;
      case 'sysadmin':
        return $localize`:labelling:sysadmin`;
      case 'coordinators':
        return $localize`:labelling:coordinators`;
      case 'coordinator':
        return $localize`:labelling:coordinator`;
      case 'inst_admin':
        return $localize`:labelling:inst_admin`;
      default: // added default to allow graceful failure handling
        return role;
    }
  }

  isColor(color: string, primaryColor: Colors["primary"]): boolean {
    if (this.isEmpty(primaryColor)) {
      return false;
    }

    const hsl = convert.hex.hsl(primaryColor);
    switch (color.toLowerCase()) {
      case 'red':
        const hueMatched = hsl[0] >= 345 || hsl[0] <= 15;
        const saturationMatched = hsl[1] >= 80 || hsl[1] <= 100;
        const lightnessMatched = hsl[2] >= 40 || hsl[2] <= 60;
        if (hueMatched && saturationMatched && lightnessMatched) {
          return true;
        }
        break;
    }

    return false;
  }

  /**
 * This will check if quill editor content is empty or not.
 * reason we need this is quill will return html tags. if user hit enter without any text quill still send html content.
 * so we can't just check null, ''.
 * ex: - if user just hist enter 2 times without type any word quill will return this.
 * <p><br/></p><p><br/></p>
 * if we only check null or '' user will be able to submit empty values in quill editor.
 * @param editorContent content user typed in quill editor.
 * @returns boolean - if content is only empty html tags or it have text in it.
 */
  isQuillContentEmpty(editorContent: string) {
    if (editorContent.replace(/<(.|\n)*?>/g, '').trim().length === 0) {
      return true;
    }
    return false;
  }

  /**
   * This method will add matcher to the clipboard of the quill editor.
   * And it will make sure every thing user paste will paste as plain text. without any formating that pasting text have.
   * Reason we need this.
   * User may copy and paste some formated text that may contain formats we are not supporting. So if those send as message
   * UI/UX will out. becouse we didn't support them. that's why we make sure we remove formating  from text that user paste to text editor.
   * @param quillEditor Quill text editor instance
   * @returns quill clipboard matcher event
   */
  formatQuillClipboard(quillEditor: any) {
    return quillEditor.clipboard.addMatcher(Node.ELEMENT_NODE, (node: any, delta: any) => {
      const plaintext = node.innerText;
      return new Delta().insert(plaintext);
    });
  }

  moveToNewLocale(newLocale: string) {
    const currentURL = this.getCurrentLocation();
    const currentLocale = this.getCurrentLocale();

    if (currentLocale === newLocale) {
      return;
    }

    // if pathname begin with "/v3/" (for development purpose only)
    const pathname = currentURL.pathname.match(/\/(\w\-?){2,5}\//);
    if (currentURL.pathname.indexOf('/v3/') === 0) {
      return this.redirectToUrl(`${currentURL.origin}/${newLocale}${currentURL.pathname}`);
    }

    // if pathname begin with different locale
    const safePathName = pathname ? pathname[0] : '';
    const newPath = currentURL.pathname.replace(safePathName, `/${newLocale}/`);
    return this.redirectToUrl(`${currentURL.origin}${newPath}`);
  }

  async openSupportPopup(options?: { formOnly: boolean; }) {
    const componentProps = {
      mode: 'modal',
      isShowFormOnly: options?.formOnly,
    };

    const modal = await this.modalController.create({
      componentProps,
      component: SupportPopupComponent,
      cssClass: 'support-popup',
      backdropDismiss: false,
    });

    return modal.present();
  }

  checkIsPracteraSupportEmail() {
    const currentExperience = this.storageService.get('experience');
    if (currentExperience && currentExperience.supportEmail) {
      const supportEmail = currentExperience.supportEmail;
      if (supportEmail.includes("@practera.com")) {
        this.broadcastEvent('support-email-checked', true);
        return true;
      }
      this.broadcastEvent('support-email-checked', false);
      return false;
    }
    this.broadcastEvent('support-email-checked', false);
    return false;
  }

  getSupportEmail() {
    const expId = this.storageService.getUser().experienceId;
    const programList = this.storageService.get('programs');
    if (!expId || !programList || programList.length < 1) {
      return;
    }
    const currentExperience = programList.find((program)=> {
      return program.experience.id === expId;
    });
    if (currentExperience) {
      const supportEmail = currentExperience.experience.support_email;
      if (supportEmail) {
        return supportEmail;
      }
      return null;
    }
    return null;
  }

  // set page title
  setPageTitle(title: string) {
    this.title.setTitle(title);
  }
}
