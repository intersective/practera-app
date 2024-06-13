import { Injectable, Optional, isDevMode } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpErrorResponse,
  HttpParameterCodec,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError, concatMap } from 'rxjs/operators';
import { has, isEmpty, each } from 'lodash';

interface RequestOptions {
  headers?: any;
  params?: any;
}

@Injectable({ providedIn: 'root' })
export class DevModeService {
  isDevMode() {
    return isDevMode();
  }
}

export class RequestConfig {
  appkey = '';
  prefixUrl = '';
}

export class QueryEncoder implements HttpParameterCodec {
  encodeKey(k: string): string {
    return encodeURIComponent(k);
  }

  encodeValue(v: string): string {
    return encodeURIComponent(v);
  }

  decodeKey(k: string): string {
    return decodeURIComponent(k);
  }

  decodeValue(v: string): string {
    return decodeURIComponent(v);
  }
}

interface POSTParams {
  endPoint: string;
  data: any;
  httpOptions?: any;
  isFullURL?: boolean;
  customErrorHandler?: Function; // flag to indicate whether to handle error in different way
}

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  private appkey: string = '';
  private prefixUrl: string = '';
  private loggedOut: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Optional() config: RequestConfig,
    private devMode: DevModeService,
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
  appendHeaders(header = {}) {
    const headers = new HttpHeaders(Object.assign({ 'Content-Type': 'application/json' }, header));
    return headers;
  }

  /**
   *
   * @param options
   * @returns {any}
   */
  setParams(options: {[key:string]: any}) {
    let params: any;
    if (!isEmpty(options)) {
      params = new HttpParams();
      each(options, (value, key) => {
        params = params.append(key, value);
      });
    }
    return params;
  }

  private getEndpointUrl(endpoint: string): string {
    // if full, then skip
    if (endpoint && (endpoint.includes('https://') || endpoint.includes('http://'))) {
      return endpoint;
    }

    return this.prefixUrl + endpoint;
  }

  /**
   *
   * @param {string} endPoint
   * @param options
   * @param headers
   * @returns {Observable<any>}
   */
  get(endPoint: string = '', httpOptions?: RequestOptions): Observable<any> {
    if (!httpOptions) {
      httpOptions = {};
    }

    if (!has(httpOptions, 'headers')) {
      httpOptions.headers = '';
    }
    if (!has(httpOptions, 'params')) {
      httpOptions.params = '';
    }

    const request = this.http.get<any>(this.getEndpointUrl(endPoint), {
      headers: this.appendHeaders(httpOptions.headers),
      params: this.setParams(httpOptions.params)
    })
    .pipe(concatMap(response => {
      return of(response);
    }))
    .pipe(catchError((error) => this.handleError(error)));

    return request;
  }

  post(params: POSTParams): Observable<any> {
    if (!params.httpOptions) {
      params.httpOptions = {};
    }

    if (!has(params.httpOptions, 'headers')) {
      params.httpOptions.headers = '';
    }
    if (!has(params.httpOptions, 'params')) {
      params.httpOptions.params = '';
    }

    const endpoint = this.getEndpointUrl(params.endPoint);
    return this.http.post<any>(endpoint, params.data, {
      headers: this.appendHeaders(params.httpOptions.headers),
      params: this.setParams(params.httpOptions.params)
    })
    .pipe(
      concatMap(response => {
        return of(response);
      }),
      catchError((error) => {
        if (typeof params.customErrorHandler == "function") {
          return params.customErrorHandler(error);
        }
        return this.handleError(error);
      })
    );
  }

  put(endPoint: string, data: any, httpOptions?: any): Observable<any> {
    if (!httpOptions) {
      httpOptions = {};
    }

    if (!has(httpOptions, 'headers')) {
      httpOptions.headers = '';
    }
    if (!has(httpOptions, 'params')) {
      httpOptions.params = '';
    }

    const endpoint = this.getEndpointUrl(endPoint);
    return this.http.put<any>(endpoint, data, {
      headers: this.appendHeaders(httpOptions.headers),
      params: this.setParams(httpOptions.params)
    })
      .pipe(concatMap(response => {
        return of(response);
      }))
      .pipe(
        catchError((error) => this.handleError(error))
      );
  }

  /**
   *
   */
  delete(endPoint: string, httpOptions: RequestOptions = {}): Observable<any> {
    if (!has(httpOptions, 'headers')) {
      httpOptions.headers = '';
    }
    if (!has(httpOptions, 'params')) {
      httpOptions.params = '';
    }

    return this.http.delete<any>(this.getEndpointUrl(endPoint), {
      headers: this.appendHeaders(httpOptions.headers),
      params: this.setParams(httpOptions.params)
    })
      .pipe(concatMap(response => {
        return of(response);
      }))
      .pipe(
        catchError((error) => this.handleError(error))
      );
  }

  /**
   *
   * @returns {string}
   */
  public getAppkey(): string {
    return this.appkey;
  }

  public apiResponseFormatError(msg = '') {
    console.error('API response format error.\n' + msg);
    return;
  }

  public handleError(error: HttpErrorResponse | any) {
    if (this.devMode.isDevMode() && error) {
      console.error(
        `Backend returned code ${error?.status}, ` +
        `body was: ${error?.error}, ` +
        `message was: ${error?.message}`
      ); // log to console instead
    }

    // log the user out if jwt expired
    if (has(error, 'error.message') && [
      'Request must contain an apikey',
      'Expired apikey',
      'Invalid apikey'
    ].includes(error?.error?.message) && !this.loggedOut) {
      // in case lots of api returns the same apikey invalid at the same time
      this.loggedOut = true;
      setTimeout(
        () => {
          this.loggedOut = false;
        },
        2000
      );
      this.router.navigate(['auth', 'logout']);
    }

    // if error.error is a html template error (when try to read remote version.txt)
    if (typeof error?.error === 'string' && error.error.indexOf('<!DOCTYPE html>') !== -1) {
      return throwError(error?.message);
    }
    if (error?.status === 0) {
      console.error('An error occurred:', error.error);
    }
    if (error?.graphQLErrors?.length > 0) {
      return throwError(error?.graphQLErrors[0]);
    }
    return throwError(error);
  }
}
