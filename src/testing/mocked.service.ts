import { of, Observable } from 'rxjs';
import { SpyObject } from './utils';

export class MockNewRelicService {
  noticeError() {
    return true;
  }
  actionText() {
    return true;
  }
}

export class FastFeedbackServiceMock {
  pullFastFeedback(): Observable<any> {
    return of({
      present: () => {
        return new Promise<any>(resolve => resolve(true));
      },
      onDidDismiss: (data) => {
        return new Promise<any>(resolve => resolve(data));
      }
    });
  }

  fastFeedbackModal() {
    return true;
  }

  getFastFeedback() {
    return;
  }
}
