import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { AuthService } from '@app/auth/auth.service';
import { BrowserStorageService, Stack } from '@app/services/storage.service';
import { of } from 'rxjs';

import { SwitcherResolverService } from './switcher-resolver.service';

describe('SwitcherResolverService', () => {
  const mockOneStack: Stack = {
    uuid: 'b0f6328e-379c-4cd2-9e96-1363a49ab001',
    name: 'Practera Classic App - Stage',
    description: 'Participate in an experience as a learner or reviewer - Testing',
    image: 'https://media.intersective.com/img/learners_reviewers.png',
    url: 'https://app.p1-stage.practera.com',
    type: 'app',
    coreApi: 'https://admin.p1-stage.practera.com',
    coreGraphQLApi: 'https://core-graphql-api.p1-stage.practera.com',
    chatApi: 'https://chat-api.p1-stage.practera.com',
    filestack: {
      s3Config: {
        container: 'files.p1-stage.practera.com',
        region: 'ap-southeast-2'
      },
    },
    defaultCountryModel: 'AUS',
    lastLogin: 1619660600368
  };

  let storageSpy: jasmine.SpyObj<BrowserStorageService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      {
        provide: AuthService,
        useValue: jasmine.createSpyObj('AuthService', {
          'getStacks': {
            toPromise: () => Promise.resolve([mockOneStack])
          }
        })
      },
      // BrowserStorageService
      {
        provide: BrowserStorageService,
        useValue: jasmine.createSpyObj('BrowserStorageService', [
          'stacks'
        ])
      }
    ]
  }));

  it('should be created', () => {
    const service: SwitcherResolverService = TestBed.inject(SwitcherResolverService);
    expect(service).toBeTruthy();
  });

  describe('resolve()', () => {
    let service: SwitcherResolverService;
    beforeEach(() => {
      service = TestBed.inject(SwitcherResolverService);
      authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
      storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
    });

    it('should be return stacks from localStorage', fakeAsync(() => {
      service.resolve();
      flushMicrotasks();

      expect(authServiceSpy.getStacks).toHaveBeenCalled();
    }));

    it('should be return stacks from localStorage', fakeAsync(() => {
      const SAMPLE = [mockOneStack, mockOneStack];
      storageSpy.stacks = SAMPLE;
      service.resolve().then(res => {
        expect(res).toEqual(SAMPLE);
      });
      flushMicrotasks();
    }));
  });
});
