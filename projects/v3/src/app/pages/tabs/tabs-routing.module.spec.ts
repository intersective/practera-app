import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { ChatPage } from '../chat/chat.page';
import { TabsPageRoutingModule } from './tabs-routing.module';

@Component({ template: '' })
class RoutedPage {}

describe('Tab page titles', () => {
  let router: Router;
  let title: Title;
  let originalTitle: string;
  let experience: { name: string };

  beforeEach(async () => {
    experience = { name: 'Learning &amp; Practice' };
    TestBed.configureTestingModule({
      imports: [TabsPageRoutingModule],
      declarations: [ChatPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        provideRouter([]),
        { provide: BrowserStorageService, useValue: { get: () => experience } },
        { provide: UtilsService, useValue: {
          decodeHtmlEntities: UtilsService.prototype.decodeHtmlEntities,
          document,
          setPageTitle: (value: string) => TestBed.inject(Title).setTitle(value),
        } },
      ],
    });
    router = TestBed.inject(Router);
    // Keep the production tab routes and title resolvers, replacing page data
    // loading with an empty page so navigation needs no backend or learner login.
    const tabs = router.config.find(route => route.children)?.children || [];
    router.resetConfig([{ path: 'v3', children: tabs.map(route => ({
      ...route,
      children: undefined,
      loadChildren: route.path === 'messages'
        ? () => Promise.resolve([{ path: '', component: RoutedPage }, { path: 'chat-room', component: RoutedPage }])
        : undefined,
      ...(route.redirectTo || route.path === 'messages' ? {} : { component: RoutedPage }),
    })) }]);
    title = TestBed.inject(Title);
    originalTitle = title.getTitle();
    await RouterTestingHarness.create();
  });

  afterEach(() => title.setTitle(originalTitle));

  it('restores Events after Home → Events → Messages → Events, repeatedly', async () => {
    await router.navigateByUrl('/v3/home');
    // Simulate the first page creation; cached Ionic pages will not repeat it.
    title.setTitle('Events - Practera');
    await router.navigateByUrl('/v3/events');
    for (let i = 0; i < 3; i++) {
      await router.navigateByUrl('/v3/messages');
      title.setTitle('Messages - Practera');
      await router.navigateByUrl('/v3/events');
      expect(title.getTitle()).toBe('Events - Practera');
    }
  });

  it('does not let a late Messages enter hook overwrite the destination title', async () => {
    const chat = TestBed.createComponent(ChatPage).componentInstance;
    await router.navigateByUrl('/v3/messages');
    await router.navigateByUrl('/v3/events');
    title.setTitle('Events - Practera');
    (chat as any).ionViewDidEnter?.();
    expect(title.getTitle()).toBe('Events - Practera');
  });

  it('restores the decoded experience title on Home, including quick return visits', async () => {
    await router.navigateByUrl('/v3/home');
    expect(title.getTitle()).toBe('Learning & Practice');
    await router.navigateByUrl('/v3/messages');
    await router.navigateByUrl('/v3/home?tab=overview');
    expect(title.getTitle()).toBe('Learning & Practice');
    experience = undefined;
    await router.navigateByUrl('/v3/messages');
    await router.navigateByUrl('/v3/home');
    expect(title.getTitle()).toBe('Practera');
  });

  it('preserves the selected desktop review title on query-only navigation', async () => {
    await router.navigateByUrl('/v3/review-desktop');
    // Desktop review details own their title once the review data has loaded.
    title.setTitle('Peer feedback');
    await router.navigateByUrl('/v3/review-desktop?view=details');
    expect(title.getTitle()).toBe('Peer feedback');
  });

  for (const [path, expected] of [
    ['messages/chat-room', 'Messages - Practera'],
    ['settings', 'Settings - Practera'],
    ['notifications', 'Notifications - Practera'],
    ['due-dates', 'Due Dates - Practera'],
    ['reviews', 'Reviews - Practera'],
    ['badges-certificates', 'Badges & Certificates - Practera'],
  ]) {
    it(`restores the title when returning to ${path}`, async () => {
      const url = `/v3/${path}`;
      await router.navigateByUrl(url);
      await router.navigateByUrl('/v3/events');
      await router.navigateByUrl(url);
      expect(title.getTitle()).toBe(expected);
    });
  }
});
