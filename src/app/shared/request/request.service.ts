import { Injectable, Optional, isDevMode } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse, HttpParameterCodec } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { UtilsService } from '@services/utils.service';
import { BrowserStorageService } from '@services/storage.service';

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

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  private appkey: string;
  private prefixUrl: string;

  constructor(
    private http: HttpClient,
    private utils: UtilsService,
    private storage: BrowserStorageService,
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
    const headers = new HttpHeaders(header);
    return headers;
  }

  /**
   *
   * @param options
   * @returns {any}
   */
  setParams(options) {
    let params: any;
    if (!this.utils.isEmpty(options)) {
      params = new HttpParams();
      this.utils.each(options, (value, key) => {
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
  get(endPoint: string = '', httpOptions?: any): Observable<any> {
    if (!httpOptions) {
      httpOptions = {
        headers: '',
        params: ''
      };
    }
    if (!this.utils.has(httpOptions, 'headers')) {
      httpOptions.headers = '';
    }
    if (!this.utils.has(httpOptions, 'params')) {
      httpOptions.params = '';
    }
    return this.http.get<any>(this.prefixUrl + endPoint, {
      headers: this.appendHeaders(httpOptions.headers),
      params: this.setParams(httpOptions.params)
    }).pipe(
      catchError(this.handleError)
    );
  }

  post(endPoint: string = '', data, httpOptions?: any): Observable<any> {
    if (!httpOptions) {
      httpOptions = {
        headers: '',
        params: ''
      };
    }
    if (!this.utils.has(httpOptions, 'headers')) {
      httpOptions.headers = '';
    }
    if (!this.utils.has(httpOptions, 'params')) {
      httpOptions.params = '';
    }
    return this.http.post<any>(this.prefixUrl + endPoint, data, {
      headers: this.appendHeaders(httpOptions.headers),
      params: this.setParams(httpOptions.params)
    }).pipe(
      catchError(this.handleError)
    );
  }

  delete(endPoint: string = '', httpOptions?: any): Observable<any> {
    if (!httpOptions) {
      httpOptions = {
        headers: '',
        params: ''
      };
    }
    if (!this.utils.has(httpOptions, 'headers')) {
      httpOptions.headers = '';
    }
    if (!this.utils.has(httpOptions, 'params')) {
      httpOptions.params = '';
    }
    return this.http.delete<any>(this.prefixUrl + endPoint, {
      headers: this.appendHeaders(httpOptions.headers),
      params: this.setParams(httpOptions.params)
    }).pipe(
      catchError(this.handleError)
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

  public apiResponseFormatError(msg = '') {
    console.error('API response format error.\n' + msg);
    return;
  }

  private handleError(error: HttpErrorResponse) {
    if (isDevMode()) {
      console.error(error); // log to console instead
    }
    // Return the error response data
    return throwError(error.error);
  }

  // further enhance this for error reporting (piwik)
  private log(message: string) {
    console.log(message);
  }
}
