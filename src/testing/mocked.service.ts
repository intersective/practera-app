import { of, Observable } from 'rxjs';

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
        console.log(data);
        return;
      }
    });
  }
}
