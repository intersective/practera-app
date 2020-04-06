import { TestBed } from '@angular/core/testing';
import { PusherModule } from './pusher.module';

describe('PusherModule', () => {
  let pusherModule: PusherModule;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        PusherModule.forRoot({
          pusherKey: 'TEST',
          apiurl: 'TEST',
        }),
      ],
    });

    pusherModule = TestBed.inject(PusherModule);
  });

  it(`should provide services`, () => {
    expect(pusherModule).toBeTruthy();
  });
});
