import { Injectable } from "@angular/core";
import { ApolloService } from '@v3/services/apollo.service';
import { UtilsService } from "./utils.service";
import { RequestService as request } from 'request';
import { map } from "rxjs/operators";

@Injectable({
  providedIn: 'root',
})
export class RequestService extends request {
  constructor(
    private utils: UtilsService,
    private apolloService: ApolloService
  ) {
    super();
  }

  /**
   * Valid options:
   * noCache: Boolean default false. If set to false, will not cache the result
   */
  graphQLWatch(query: string, variables ?: any, options ?: any): Observable < any > {
    options = { ...{ noCache: false }, ...options };
    const watch = this.apolloService.graphQLWatch(query, variables, options);
    return watch.valueChanges
      .pipe(map(response => {
        this._refreshApikey(response);
        return response;
      }))
      .pipe(
        catchError((error) => this.handleError(error))
      );
  }

  /**
   * fetch GraplQL api once
   *
   * @param   {string}           query
   * @param   {any}              variables
   * @param   {any<any>}         options
   *
   * @return  {Observable<any>}
   */
  graphQLFetch(query: string, variables ?: any): Observable < any > {
    return this.apolloService.graphQLFetch(query, variables)
      .pipe(map(response => {
        this._refreshApikey(response);
        return response;
      }))
      .pipe(
        catchError((error) => this.handleError(error))
      );
  }

  /**
   *
   * @todo: graphQLMutate docsblocks
   */
  graphQLMutate(query: string, variables = {}): Observable < any > {
    return this.apolloService.graphQLMutate(query, variables)
      .pipe(
        concatMap(response => {
          this._refreshApikey(response);
          return of(response);
        }),
        catchError((error) => this.handleError(error))
      );
  }

  /**
   * Valid options:
   * noCache: Boolean default false. If set to false, will not cache the result
   */
  chatGraphQLQuery(query: string, variables ?: any, options ?: any): Observable < any > {
    options = { ...{ noCache: false }, ...options };
    const watch = this.apolloService.chatGraphQLQuery(query, variables, options);
    return watch.valueChanges
      .pipe(map(response => {
        this._refreshApikey(response);
        return response;
      }))
      .pipe(
        catchError((error) => this.handleError(error))
      );
  }

  /**
   *
   */
  chatGraphQLMutate(query: string, variables = {}): Observable < any > {
    return this.apolloService.chatGraphQLMutate(query, variables).pipe(
      concatMap(response => {
        return of(response);
      }),
      catchError((error) => this.handleError(error))
    );
  }

  /**
   * Refresh the apikey (JWT token) if API returns it
   *
   */
  private _refreshApikey(response) {
    if (this.utils.has(response, 'apikey')) {
      this.storage.setUser({ apikey: response.apikey });
    }
  }
}
