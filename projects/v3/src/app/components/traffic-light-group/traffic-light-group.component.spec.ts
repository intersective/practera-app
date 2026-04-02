import { FastFeedbackService } from '@v3/services/fast-feedback.service';
import { BrowserStorageService } from '@v3/app/services/storage.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { of } from 'rxjs';
import { TrafficLightGroupComponent } from './traffic-light-group.component';

describe('TrafficLightGroupComponent', () => {
  let component: TrafficLightGroupComponent;
  let fastFeedbackService: jasmine.SpyObj<FastFeedbackService>;
  let storageService: jasmine.SpyObj<BrowserStorageService>;
  let notificationsService: jasmine.SpyObj<NotificationsService>;

  beforeEach(() => {
    fastFeedbackService = jasmine.createSpyObj<FastFeedbackService>('FastFeedbackService', [
      'pullFastFeedback',
    ]);
    fastFeedbackService.pullFastFeedback.and.returnValue(of(null) as any);

    notificationsService = jasmine.createSpyObj<NotificationsService>('NotificationsService', [
      'showTeamCheckInAlert',
    ]);
    notificationsService.showTeamCheckInAlert.and.returnValue(Promise.resolve() as any);

    storageService = jasmine.createSpyObj<BrowserStorageService>('BrowserStorageService', ['getUser', 'set']);
    storageService.getUser.and.returnValue({ role: 'participant' } as any);

    component = new TrafficLightGroupComponent(
      fastFeedbackService,
      storageService,
      notificationsService
    );
    component.lights = {
      self: 0.2,
      expert: 0.6,
      team: 0.7,
      teams: [{ teamName: 'Team A', average: 0.4 }]
    } as any;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should identify mentor role', () => {
    storageService.getUser.and.returnValue({ role: 'mentor' } as any);

    expect(component.isMentor).toBeTrue();
  });

  it('should expose learner groups', () => {
    expect(component.learnerGroups).toEqual(['self', 'team', 'expert']);
  });

  it('should expose team groups from lights', () => {
    expect(component.teamGroups).toEqual([{ teamName: 'Team A', average: 0.4 }]);
  });

  it('should return empty team groups when lights undefined', () => {
    component.lights = undefined;

    expect(component.teamGroups).toEqual([]);
  });

  it('should not navigate when displayOnly is true', async () => {
    component.displayOnly = true;

    await component.navigateToPulseCheck('self');

    expect(fastFeedbackService.pullFastFeedback).not.toHaveBeenCalled();
    expect(storageService.set).not.toHaveBeenCalled();
  });

  it('should navigate to pulse check and reset loading state', async () => {
    await component.navigateToPulseCheck('self');

    expect(component.loading.self).toBeFalse();
    expect(fastFeedbackService.pullFastFeedback).toHaveBeenCalledWith({
      skipChecking: true,
      closable: true
    });
    expect(storageService.set).toHaveBeenCalledWith('fastFeedbackOpening', false);
  });

  it('should route self click to pulse check', async () => {
    spyOn(component, 'navigateToPulseCheck').and.returnValue(Promise.resolve());

    await component.handleTrafficLightClick('self', 0.2);

    expect(component.navigateToPulseCheck).toHaveBeenCalledWith('self');
    expect(notificationsService.showTeamCheckInAlert).not.toHaveBeenCalled();
  });

  it('should skip alert when value is undefined', async () => {
    await component.handleTrafficLightClick('team', undefined as any);

    expect(notificationsService.showTeamCheckInAlert).not.toHaveBeenCalled();
  });

  it('should skip alert when value is above threshold', async () => {
    await component.handleTrafficLightClick('team', 0.8);

    expect(notificationsService.showTeamCheckInAlert).not.toHaveBeenCalled();
  });

  it('should show alert when value is at or below threshold', async () => {
    await component.handleTrafficLightClick('team', 0.65);

    expect(notificationsService.showTeamCheckInAlert).toHaveBeenCalled();
  });
});
