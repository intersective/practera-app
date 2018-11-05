import { Injectable, Optional } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import * as _ from 'lodash';

export class RequestConfig {
  appkey = '';
  prefixUrl = 'http://local.practera.com/';
}

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  private appkey: string;
  private prefixUrl: string;

  constructor(
    private http: HttpClient,
    @Optional() config: RequestConfig
  ) {
    if (config) {
      this.appkey = config.appkey;
      this.prefixUrl = config.prefixUrl;
    }
  }

  /**
   *
   * @param {'Content-Type': string } header
   * @returns {HttpHeaders}
   */
  appendHeaders(header = {'Content-Type': 'application/json'}) {
    let headers = new HttpHeaders(header);
    return headers;
  }

  /**
   *
   * @param options
   * @returns {any}
   */
  setParams(options) {
    let params: any;
    if (!_.isEmpty(options)) {
      params = new HttpParams();
      _.each(options, (value, key) => {
        params = params.append(key, value);
      });
    }
    return params;
  }

  /**
   *
   * @param {string} endPoint
   * @param options
   * @param headers
   * @returns {Observable<any>}
   */
  get(endPoint: string = '', options?: any, headers?: any): Observable<any> {
    return this.http.get<any>(this.prefixUrl + endPoint, {
      headers: this.appendHeaders(headers),
      params: this.setParams(options)
    }).pipe(
      catchError(this.handleError<any>('API Request'))
    );
  }

  post(endPoint: string = '', data, options?: any, headers?: any): Observable<any> {
    return this.http.post<any>(this.prefixUrl + endPoint, data, {
      headers: this.appendHeaders(headers),
      params: this.setParams(options)
    }).pipe(
      catchError(this.handleError<any>('API Request'))
    );
  }


  /**
   *
   * @returns {string}
   */
  public getPrefixUrl() {
    return this.prefixUrl;
  }

  /**
   *
   * @returns {string}
   */
  public getAppkey() {
    return this.appkey;
  }

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
   
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead
   
      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);
   
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  // further enhance this for error reporting (piwik)
  private log(message: string) {
    console.log(message);
  }
}
