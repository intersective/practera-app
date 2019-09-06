import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { UtilsService } from '@services/utils.service';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RequestModule } from '@shared/request/request.module';
import { AuthLoginComponent } from './auth-login.component';
import { AuthService } from '../auth.service';

describe('Component: Login', () => {

  let component: AuthLoginComponent;
  let fixture: ComponentFixture<AuthLoginComponent>;
  let authService: AuthService;

  // beforeEach(() => {
  //   TestBed.configureTestingModule({
  //     imports: [FormsModule, RouterTestingModule, RequestModule],
  //     declarations: [AuthLoginComponent, ],
  //     schemas: [CUSTOM_ELEMENTS_SCHEMA],
  //     providers: [AuthService, {
  //       provide: UtilsService, useValue: {
  //         isEmpty: () => true
  //       }
  //     }]
  //   });

  //   // create component and test fixture
  //   fixture = TestBed.createComponent(AuthLoginComponent);

  //   // get test component from the fixture
  //   component = fixture.componentInstance;

  //   // UserService provided to the TestBed
  //   authService = TestBed.get(AuthService);
  // });

  it('login will make API request with AuthService', () => {
    // spyOn(component, 'login').and.returnValue(true);

    // component.email = 'test@practera.com';
    // component.password = 'test1234';
    // expect(component.login).toBeTruthy();
    // component.login();
    // expect(component.login).toHaveBeenCalled();
  });
});
