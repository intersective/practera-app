import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AuthLoginComponent } from './auth-login.component';
import { AuthService } from "../auth.service";

describe('Component: Login', () => {

  let component: AuthLoginComponent;
  let fixture: ComponentFixture<AuthLoginComponent>; 
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AuthLoginComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [AuthService]
    });

    // create component and test fixture
    fixture = TestBed.createComponent(AuthLoginComponent); 

    // get test component from the fixture
    component = fixture.componentInstance; 

    // UserService provided to the TestBed
    authService = TestBed.get(AuthService); 
  });

  it('login will make API request with AuthService', () => {
    spyOn(authService, 'login').and.returnValue(true);
    expect(component.login({
      email: 'test@practera.com',
      password: 'test1234',
    })).toBeTruthy();
    expect(authService.login).toHaveBeenCalled();
  });
});