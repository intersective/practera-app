import { TestBed } from '@angular/core/testing';
import { HubspotService } from './hubspot.service';
import { RequestService } from 'request';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { UtilsService } from '@v3/services/utils.service';
import { environment } from '@v3/environments/environment';
import { TestUtils } from '@testingv3/utils';
import { BrowserStorageService } from '@v3/services/storage.service';

describe('HubspotService', () => {
  let service: HubspotService;
  let requestSpy: jasmine.SpyObj<RequestService>;
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;
  let utils: UtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HubspotService,
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        {
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', ['get', 'post', 'apiResponseFormatError'])
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', ['getUser', 'getReferrer', 'get'])
        }
      ]
    });
    service = TestBed.inject(HubspotService);
    requestSpy = TestBed.inject(RequestService) as jasmine.SpyObj<RequestService>;
    utils = TestBed.inject(UtilsService);
    storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  const tempUser = {
    uuid: 'uuid-1',
    name: 'test user',
    firstName: 'test',
    lastName: 'user',
    email: 'test@abcd.com',
    image: 'https://swapnil2597.github.io/assets/img/profile.png',
    role: 'participent',
    contactNumber: '1212121212',
    userHash: '1234#asdwdd',
    institutionName: 'Test institute',
    teamName: 'team 1',
    experienceId: 1234
  }

  const tempPrograms = [
    {
      experience: {
        id: 1234,
        name: 'Global Trade Accelerator - 01',
        config: {
          primary_color: '#2bc1d9',
          secondary_color: '#9fc5e8',
          email_template: 'email_1',
          card_url: 'https://cdn.filestackcontent.com/uYxes8YBS2elXV0m2yjA',
          manual_url: 'https://www.filepicker.io/api/file/lNQp4sFcTjGj2ojOm1fR',
          design_url: 'https://www.filepicker.io/api/file/VuL71nOUSiM9NoNuEIhS',
          overview_url: 'https://vimeo.com/325554048'
        },
        lead_image: 'https://cdn.filestackcontent.com/urFIZW6TuC9lujp0N3PD',
        support_email: 'help@practera.com'
      }
    }
  ]

  const params = {
    subject: 'test',
    content: 'test',
    file: {},
    consentToProcess: true
  };

  const hubspotSubmitData = {
    "fields": [
        {
            "name": "email",
            "value": "test@abcd.com"
        },
        {
            "name": "firstname",
            "value": "test"
        },
        {
            "name": "lastname",
            "value": "user"
        },
        {
            "name": "TICKET.subject",
            "value": "test"
        },
        {
            "name": "TICKET.content",
            "value": "test"
        },
        {
            "name": "TICKET.institution_name",
            "value": "Test institute"
        },
        {
            "name": "TICKET.server_location",
            "value": "AU"
        },
        {
            "name": "TICKET.phone_number",
            "value": "1212121212"
        },
        {
            "name": "TICKET.source_type",
            "value": "FORM"
        },
        {
            "name": "TICKET.user_role",
            "value": "Learner"
        },
        {
            "name": "TICKET.team",
            "value": "team 1"
        },
        {
            "name": "TICKET.hs_file_upload",
            "value": "{}"
        },
        {
            "name": "TICKET.experience_or_program",
            "value": "Global Trade Accelerator - 01"
        }
    ],
    "legalConsentOptions": {
        "consent": {
            "consentToProcess": true,
            "text": "I agree to the collection and storage of my data from this form. I understand that this information will be used to process my request and I agree to be contacted for this purpose.",
            "communications": [
                {
                    "value": true,
                    "subscriptionTypeId": 999,
                    "text": "I agree to receive marketing communications from Practera."
                }
            ]
        }
    }
  }

  describe('when testing submitDataToHubspot()', () => {

    it('should call hubspot API with correct data', () => {
      storageSpy.getUser.and.returnValue(tempUser);
      storageSpy.get.and.returnValue(tempPrograms);
      service.submitDataToHubspot(params);
      expect(requestSpy.post.calls.count()).toBe(1);
    });

    it('should return correct user role "Learner"', () => {
      const hubspotFields = [ ...hubspotSubmitData.fields ];
      storageSpy.getUser.and.returnValue(tempUser);
      storageSpy.get.and.returnValue(tempPrograms);
      service.submitDataToHubspot(params);
      expect(requestSpy.post.calls.first().args[0].data.fields).toEqual(hubspotFields);
    });

    it('should return correct user role "Expert"', () => {
      const hubspotFields = [ ...hubspotSubmitData.fields ];
      hubspotFields[9].value = 'Expert';
      const user = { ... tempUser };
      user.role = 'mentor';
      storageSpy.getUser.and.returnValue(user);
      storageSpy.get.and.returnValue(tempPrograms);
      service.submitDataToHubspot(params);
      expect(requestSpy.post.calls.first().args[0].data.fields).toEqual(hubspotFields);
    });

    it('should return same user role if it not match', () => {
      const hubspotFields = [ ...hubspotSubmitData.fields ];
      hubspotFields[9].value = 'admin';
      const user = { ... tempUser };
      user.role = 'admin';
      storageSpy.getUser.and.returnValue(user);
      storageSpy.get.and.returnValue(tempPrograms);
      service.submitDataToHubspot(params);
      expect(requestSpy.post.calls.first().args[0].data.fields).toEqual(hubspotFields);
    });

    it('should return empty string for "firstname" if it not found', () => {
      const hubspotFields = [ ...hubspotSubmitData.fields ];
      hubspotFields[9].value = 'Learner';
      hubspotFields[1].value = '';
      const user = { ... tempUser };
      user.firstName = null;
      storageSpy.getUser.and.returnValue(user);
      storageSpy.get.and.returnValue(tempPrograms);
      service.submitDataToHubspot(params);
      expect(requestSpy.post.calls.first().args[0].data.fields).toEqual(hubspotFields);
    });

    it('should return empty string for "lastName" if it not found', () => {
      const hubspotFields = [ ...hubspotSubmitData.fields ];
      hubspotFields[1].value = 'test';
      hubspotFields[2].value = '';
      const user = { ... tempUser };
      user.firstName = 'test';
      user.lastName = null;
      storageSpy.getUser.and.returnValue(user);
      storageSpy.get.and.returnValue(tempPrograms);
      service.submitDataToHubspot(params);
      expect(requestSpy.post.calls.first().args[0].data.fields).toEqual(hubspotFields);
    });

    it('should return empty string for "contactNumber" if it not found', () => {
      const hubspotFields = [ ...hubspotSubmitData.fields ];
      hubspotFields[2].value = 'user';
      hubspotFields[7].value = '';
      const user = { ... tempUser };
      user.lastName = 'user';
      user.contactNumber = null;
      storageSpy.getUser.and.returnValue(user);
      storageSpy.get.and.returnValue(tempPrograms);
      service.submitDataToHubspot(params);
      expect(requestSpy.post.calls.first().args[0].data.fields).toEqual(hubspotFields);
    });

    it('should return empty string for "teamName" if it not found', () => {
      const hubspotFields = [ ...hubspotSubmitData.fields ];
      hubspotFields[7].value = '1212121212';
      hubspotFields[10].value = '';
      const user = { ... tempUser };
      user.contactNumber = '1212121212';
      user.teamName = null;
      storageSpy.getUser.and.returnValue(user);
      storageSpy.get.and.returnValue(tempPrograms);
      service.submitDataToHubspot(params);
      expect(requestSpy.post.calls.first().args[0].data.fields).toEqual(hubspotFields);
    });

    it('should return empty string for "hs_file_upload" if it not found', () => {
      const hubspotFields = [ ...hubspotSubmitData.fields ];
      hubspotFields[10].value = 'team 1';
      hubspotFields[11].value = '{}';
      const user = { ... tempUser };
      user.teamName = 'team 1';
      const tempPram = { ...params };
      tempPram.file = null;
      storageSpy.getUser.and.returnValue(user);
      storageSpy.get.and.returnValue(tempPrograms);
      service.submitDataToHubspot(params);
      expect(requestSpy.post.calls.first().args[0].data.fields).toEqual(hubspotFields);
    });


    describe('if no user data in storage', () => {
      it('should not call Post request', () => {
        storageSpy.getUser.and.returnValue({});
        service.submitDataToHubspot(params);
        expect(requestSpy.post.calls.count()).toBe(0);
      });
    });

    describe('if experienceId is missing', () => {
      it('should not call Post request', () => {
        const user = tempUser;
        delete user.experienceId;
        storageSpy.getUser.and.returnValue(user);
        service.submitDataToHubspot(params);
        expect(requestSpy.post.calls.count()).toBe(0);
      });
    });

    describe('if programList is empty', () => {
      it('should not call Post request', () => {
        storageSpy.getUser.and.returnValue(tempUser);
        storageSpy.get.and.returnValue({});
        service.submitDataToHubspot(params);
        expect(requestSpy.post.calls.count()).toBe(0);
      });
    });

    describe('if no program match the program ID', () => {
      it('should not call Post request', () => {
        const program = tempPrograms;
        program[0].experience.id = 4334;
        storageSpy.getUser.and.returnValue(tempUser);
        storageSpy.get.and.returnValue(program);
        service.submitDataToHubspot(params);
        expect(requestSpy.post.calls.count()).toBe(0);
      });
    });

    describe('if no program match the program ID', () => {
      it('should not call Post request', () => {
        const program = tempPrograms;
        program[0].experience.id = 4334;
        storageSpy.getUser.and.returnValue(tempUser);
        storageSpy.get.and.returnValue(program);
        service.submitDataToHubspot(params);
        expect(requestSpy.post.calls.count()).toBe(0);
      });
    });

  });

});
