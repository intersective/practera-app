import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../auth/auth.service';
import { SettingsComponent } from './settings.component';
import { of } from 'rxjs';

describe('SettingsComponent', () => {
  // let component: SettingsComponent;
  // let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(async(() => {
    // TestBed.configureTestingModule({
    //   imports: [RouterTestingModule],
    //   declarations: [SettingsComponent],
    //   schemas: [CUSTOM_ELEMENTS_SCHEMA],
    //   providers: [
    //     {
    //       provide: AuthService, useValue: {
    //         logout: () => of(true),
    //       }
    //     }
    //   ]
    // }).compileComponents();
  }));

  beforeEach(() => {
    // fixture = TestBed.createComponent(SettingsComponent);
    // component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    // expect(component).toBeTruthy();
  });

  /*it('should initiated with default values', () => {
    component.ngOnInit();
    expect(component.email.length).toBeGreaterThan(0);
    expect(component.contact_number.length).toBeGreaterThan(0);
  });*/

  it('should navigate to switcher', () => {
    // expect(component.switchProgram).toBeDefined();
    // component.switchProgram();
    // @TODO: check routing
  });

  /*it('should logout', () => {
    expect(component.logout).toBeDefined();
    component.logout();
    expect(AuthService.logout.subscribe).toHaveBeenCalled();
  });*/

  /*it('should validate contact_number with verifyContactNumber', () => {
    expect(component.verifyContactNumber).toBeDefined();
  });*/

  it('should update profile', () => {
    // expect(component.updateProfile).toBeDefined();
    const testContactNumber = '0123456789';
    // expect(component.updateProfile(testContactNumber)).toBeTruthy();
  });
});
