import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SwitcherService } from './switcher.service';
import { of } from 'rxjs';
import { RequestService } from '@shared/request/request.service';
import { HttpClientModule } from '@angular/common/http';
import { UtilsService } from '@services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';
import { TestUtils } from '@testing/utils';

describe('SwitcherService', () => {
    let service: SwitcherService;
    let requestSpy: jasmine.SpyObj<RequestService>;
    let notificationSpy: jasmine.SpyObj<NotificationService>;
    let utils: UtilsService;
    const testUtils = new TestUtils();

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            providers: [
                SwitcherService,
                UtilsService,
                {
                    provide: RequestService,
                    useValue: jasmine.createSpyObj('RequestService', ['get', 'post', 'apiResponseFormatError'])
                },
                {
                    provide: NotificationService,
                    useValue: jasmine.createSpyObj('NotificationService', ['modal'])
                },
            ]
        });
        service = TestBed.get(SwitcherService);
        requestSpy = TestBed.get(RequestService);
        utils = TestBed.get(UtilsService);
        notificationSpy = TestBed.get(NotificationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('when testing checkIsOneProgram()', () => {
        it('should return true if got Array with one program object ', () => {
            spyOn(utils, 'isEmpty').and.returnValue(false);
            expect(service.checkIsOneProgram([{}])).toBe(true);
        });
        it('should return false if got Array multiple program objects ', () => {
            spyOn(utils, 'isEmpty').and.returnValue(false);
            expect(service.checkIsOneProgram([{}, {}, {}])).toBe(false);
        });
    });

    describe('when testing switchProgramAndNavigate()', () => {
        it('should return undefined if got empty ojbect ', async () => {
            spyOn(utils, 'isEmpty').and.returnValue(true);
            const data = await service.switchProgramAndNavigate({});
            expect(data).toBeUndefined();
        });

        it('should return [switcher] if programs is Array with multiple program objects ', async () => {
            spyOn(service, 'checkIsOneProgram').and.returnValue(false);
            spyOn(Array, 'isArray').and.returnValue(true);
            const data = await service.switchProgramAndNavigate([{}, {}, {}]);
            expect(data).toEqual(['switcher']);
        });

        it('should return [app, home] if programs is Array with multiple program objects ', async () => {
            spyOn(service, 'checkIsOneProgram').and.returnValue(true);
            spyOn(Array, 'isArray').and.returnValue(true);
            spyOn(service, 'switchProgram').and.returnValue(of({}));
            const data = await service.switchProgramAndNavigate([{}]);
            expect(data).toEqual(['app', 'home']);
        });

        it('should return [app, home] if programs is not an Array and got one program object ', async () => {
            spyOn(utils, 'isEmpty').and.returnValue(false);
            spyOn(Array, 'isArray').and.returnValue(false);
            spyOn(service, 'switchProgram').and.returnValue(of({}));
            const data = await service.switchProgramAndNavigate({});
            expect(data).toEqual(['app', 'home']);
        });
    });

});
