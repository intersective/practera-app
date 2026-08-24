import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

// ── Default term map (platform-wide fallback) ─────────────────────────────────

export const DEFAULT_TAXONOMY_TERMS: Record<string, string> = {
  institution: 'Institution',
  experience: 'Experience',
  project: 'Project',
  timeline: 'Cohort',
  milestone: 'Milestone',
  activity: 'Activity',
  task: 'Task',
  assessment: 'Assessment',
  submission: 'Submission',
  review: 'Review',
  feedback: 'Feedback',
  team: 'Team',
  team360: 'Team 360',
  badge: 'Badge',
  'role.participant': 'Learner',
  'role.mentor': 'Expert',
  'role.coordinator': 'Coordinator',
  'role.admin': 'Author',
  'role.reviewer': 'Reviewer',
};

// ── GraphQL query ─────────────────────────────────────────────────────────────

const TAXONOMY_QUERY = gql`
  query GetTaxonomy($institutionId: Int!, $locale: String) {
    taxonomy(institutionId: $institutionId, locale: $locale) {
      locale
      terms
    }
  }
`;

interface TaxonomyQueryResult {
  taxonomy: {
    locale: string;
    terms: Record<string, string>;
  } | null;
}

/**
 * TaxonomyService — configurable terminology layer for app-v2.
 *
 * Fetches institution/experience term overrides from the GraphQL API once per
 * session.  Call `load(institutionId)` after authentication to initialise.
 * Use `t(key)` anywhere to resolve a display label.
 *
 * Example:
 *   this.taxonomyService.load(user.institution_id);
 *   const label = this.taxonomyService.t('milestone'); // → "Phase" or "Milestone"
 */
@Injectable({
  providedIn: 'root',
})
export class TaxonomyService {
  private readonly _terms$ = new BehaviorSubject<Record<string, string>>(DEFAULT_TAXONOMY_TERMS);
  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  private readonly _error$ = new BehaviorSubject<Error | null>(null);

  readonly terms$: Observable<Record<string, string>> = this._terms$.asObservable();
  readonly loading$: Observable<boolean> = this._loading$.asObservable();
  readonly error$: Observable<Error | null> = this._error$.asObservable();

  constructor(private readonly apollo: Apollo) {}

  /**
   * Fetch taxonomy for the given institution.  Call after the user is
   * authenticated.  Safe to call multiple times — subsequent calls re-fetch.
   */
  async load(institutionId: number, locale = 'en'): Promise<void> {
    if (!institutionId) return;
    this._loading$.next(true);
    this._error$.next(null);

    try {
      const result = await firstValueFrom(
        this.apollo
          .query<TaxonomyQueryResult>({
            query: TAXONOMY_QUERY,
            variables: { institutionId, locale },
            fetchPolicy: 'network-only',
          })
          .pipe(
            map(r => r.data?.taxonomy?.terms),
            catchError(err => {
              const e = err instanceof Error ? err : new Error(String(err));
              console.error('[TaxonomyService] fetch failed:', e);
              this._error$.next(e);
              return of(undefined);
            }),
          ),
      );

      if (result && typeof result === 'object') {
        this._terms$.next({ ...DEFAULT_TAXONOMY_TERMS, ...result });
      }
    } finally {
      this._loading$.next(false);
    }
  }

  /**
   * Resolve a term key to its display label, with locale + default fallback.
   * Returns the key itself if not found in either overrides or defaults.
   */
  t(key: string): string {
    const terms = this._terms$.getValue();
    return terms[key] ?? DEFAULT_TAXONOMY_TERMS[key] ?? key;
  }

  /** Current resolved term map (snapshot). */
  get terms(): Record<string, string> {
    return this._terms$.getValue();
  }

  /** True while the fetch is in-flight. */
  get loading(): boolean {
    return this._loading$.getValue();
  }

  /** Non-null if the last fetch failed. */
  get error(): Error | null {
    return this._error$.getValue();
  }

  /** Reset to platform defaults (e.g. on logout). */
  reset(): void {
    this._terms$.next(DEFAULT_TAXONOMY_TERMS);
    this._error$.next(null);
    this._loading$.next(false);
  }
}
