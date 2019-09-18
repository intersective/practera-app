export class TestUtils {
  /**
   * Get a date string
   * @param day  number of dates after today. if < 0, is number of days before today
   * @param minute number of minutes after the current minute. if < 0, is number of minutes before current minute
   *
   * e.g.
   * getDateString(1, 0) returns tomorrow at the same time
   * getDateString(-1, 0) returns yesterday at the same time
   * getDateString(0, 1) returns today at one minute later
   */
  getDateString(day: number, minute: number) {
    const date = new Date();
    date.setDate(date.getDate() + day);
    date.setHours(date.getMinutes() + minute);
    return `${date.getFullYear()}-` +
      `${this.numberFormatter(date.getMonth() + 1)}-` +
      `${this.numberFormatter(date.getDate())} ` +
      `${this.numberFormatter(date.getHours())}:` +
      `${this.numberFormatter(date.getMinutes())}:` +
      `${this.numberFormatter(date.getSeconds())}`;
  }

  /**
   * add '0' before the number if it is less than 10
   * @param number the number for checking
   */
  numberFormatter(number: number) {
    return number < 10 ? '0' + number : number;
  }
}

