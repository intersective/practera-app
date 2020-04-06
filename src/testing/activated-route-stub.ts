import { convertToParamMap, ParamMap, Params } from '@angular/router';
import { ReplaySubject, of } from 'rxjs';

/**
 * An ActivateRoute test double with a `paramMap` observable.
 * Use the `setParamMap()` method to add the next `paramMap` value.
 */
export class ActivatedRouteStub {
  // Use a ReplaySubject to share previous values with subscribers
  // and pump new values into the `paramMap` observable
  private subject = new ReplaySubject<ParamMap>();
  private customParams;
  private params;
  snapshot = {
    paramMap: {
      get: (key) => {
        return this.customParams[key] ? this.customParams[key] : null;
      }
    }
  };

  constructor(initialParams?: Params) {
    this.setParamMap(initialParams);
  }

  /** The mock paramMap observable */
  readonly paramMap = this.subject.asObservable();
  readonly queryParamMap = this.subject.asObservable();

  /** Set the paramMap observables's next value */
  setParamMap(params?: Params) {
    this.subject.next(convertToParamMap(params));
    this.customParams = params;
    this.params = of(params);
  }
}
