import { AuthLogoutComponent } from './auth-logout.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from '../auth.service';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { MockNewRelicService } from '@testing/mocked.service';

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
            providers: [

                {
                    provide: AuthService,
                    useValue: jasmine.createSpyObj('AuthService', ['logout'])
                },
                {
                    provide: Router,
                    useValue: {
                        navigate: jasmine.createSpy('navigate')
                    }
                },
                {
                    provide: NewRelicService,
                    useClass: MockNewRelicService
                },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            paramMap: convertToParamMap({
                                params: 'abc'
                            })
                        }
                    }
                },
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

    it('when testing onEnter() should call auth Service logout', () => {
        const params = {abc:'abcv'};
        component.onEnter();
        expect(newRelicSpy.setPageViewName).toHaveBeenCalledWith('logout');
        routeSpy.snapshot.paramMap.get = jasmine.createSpy().and.callFake(key => params[key]);
        authSpy.logout.and.returnValue({});
        expect(authSpy.logout.calls.count()).toBe(1);
    })
})