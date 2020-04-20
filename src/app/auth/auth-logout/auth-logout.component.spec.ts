import { AuthLogoutComponent } from './auth-logout.component';
import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { AuthService } from '../auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { MockNewRelicService } from '@testing/mocked.service';
import { Observable, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { doesNotReject } from 'assert';
import { ActivatedRouteStub } from '@testing/activated-route-stub';

describe('AuthLogoutComponent', () => {
    let component: AuthLogoutComponent;
    let fixture: ComponentFixture<AuthLogoutComponent>;
    let authSpy: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let routeSpy: ActivatedRoute;
    let newRelicSpy: jasmine.SpyObj<NewRelicService>;


    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AuthLogoutComponent],
            imports: [RouterTestingModule],
            providers: [

                {
                    provide: AuthService,
                    useValue: jasmine.createSpyObj('AuthService', ['logout'])
                },

                {
                    provide: NewRelicService,
                    useClass: MockNewRelicService
                },
                {
                    provide: ActivatedRoute,
                    useValue: new ActivatedRouteStub({ t: 1 })
                }
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AuthLogoutComponent);
        component = fixture.componentInstance;
        authSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        routeSpy = TestBed.inject(ActivatedRoute);
        newRelicSpy = TestBed.inject(NewRelicService) as jasmine.SpyObj<NewRelicService>;
    });


    it('should create', () => {
        expect(component).toBeDefined();
    });

    it('when testing onEnter() and there is no route param should call auth Service logout', fakeAsync(() => {
        const params =  of({ t: 1 });
        routeSpy.snapshot.paramMap.get = jasmine.createSpy().and.callFake(key => params[key]);
        fixture.detectChanges();
        component.onEnter();
        expect(newRelicSpy.setPageViewName).toHaveBeenCalledWith('logout');
        authSpy.logout.and.returnValue({});
        expect(authSpy.logout.calls.count()).toBe(1);
    }));
});
