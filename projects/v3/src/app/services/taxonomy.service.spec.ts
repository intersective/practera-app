import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { of, throwError } from 'rxjs';
import { TaxonomyService, DEFAULT_TAXONOMY_TERMS } from './taxonomy.service';

describe('TaxonomyService', () => {
  let service: TaxonomyService;
  let apolloSpy: jasmine.SpyObj<Apollo>;

  beforeEach(() => {
    apolloSpy = jasmine.createSpyObj('Apollo', ['query']);

    TestBed.configureTestingModule({
      providers: [
        TaxonomyService,
        { provide: Apollo, useValue: apolloSpy },
      ],
    });

    service = TestBed.inject(TaxonomyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('returns default terms before load()', () => {
    expect(service.t('milestone')).toBe('Milestone');
    expect(service.t('role.mentor')).toBe('Expert');
  });

  it('returns the key for unknown terms', () => {
    expect(service.t('some.unknown.key')).toBe('some.unknown.key');
  });

  it('load() fetches taxonomy and merges on top of defaults', fakeAsync(async () => {
    apolloSpy.query.and.returnValue(of({
      data: {
        taxonomy: {
          locale: 'en',
          terms: { milestone: 'Phase', 'role.mentor': 'Industry Partner' },
        },
      },
      loading: false,
      networkStatus: 7,
    }) as any);

    await service.load(42);
    tick();

    expect(service.t('milestone')).toBe('Phase');
    expect(service.t('role.mentor')).toBe('Industry Partner');
    // unset keys keep defaults
    expect(service.t('activity')).toBe(DEFAULT_TAXONOMY_TERMS['activity']);
  }));

  it('load() falls back to defaults when fetch fails', fakeAsync(async () => {
    apolloSpy.query.and.returnValue(throwError(() => new Error('Network error')));

    await service.load(42);
    tick();

    expect(service.error).toBeInstanceOf(Error);
    // defaults are preserved
    expect(service.t('milestone')).toBe('Milestone');
  }));

  it('load() is a no-op when institutionId is falsy', fakeAsync(async () => {
    await service.load(0);
    tick();

    expect(apolloSpy.query).not.toHaveBeenCalled();
    expect(service.t('milestone')).toBe('Milestone');
  }));

  it('reset() restores platform defaults', fakeAsync(async () => {
    apolloSpy.query.and.returnValue(of({
      data: { taxonomy: { locale: 'en', terms: { milestone: 'Phase' } } },
      loading: false,
      networkStatus: 7,
    }) as any);

    await service.load(42);
    tick();
    expect(service.t('milestone')).toBe('Phase');

    service.reset();

    expect(service.t('milestone')).toBe('Milestone');
    expect(service.error).toBeNull();
    expect(service.loading).toBe(false);
  }));

  it('terms$ emits when terms update', fakeAsync(async () => {
    const emitted: Record<string, string>[] = [];
    service.terms$.subscribe(t => emitted.push(t));

    apolloSpy.query.and.returnValue(of({
      data: { taxonomy: { locale: 'en', terms: { milestone: 'Phase' } } },
      loading: false,
      networkStatus: 7,
    }) as any);

    await service.load(42);
    tick();

    expect(emitted.length).toBeGreaterThan(1);
    const last = emitted[emitted.length - 1];
    expect(last['milestone']).toBe('Phase');
  }));
});
