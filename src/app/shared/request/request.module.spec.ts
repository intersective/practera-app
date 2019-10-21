import { TestBed } from '@angular/core/testing';
import { RequestModule } from './request.module';

describe('RequestModule', () => {
  let requestModule: RequestModule;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RequestModule.forRoot({
          appkey: 'TEST',
          prefixUrl: 'TEST',
        }),
      ],
    });

    requestModule = TestBed.get(RequestModule);
  });

  it(`should provide services`, () => {
    expect(requestModule).toBeTruthy();
  });
});
