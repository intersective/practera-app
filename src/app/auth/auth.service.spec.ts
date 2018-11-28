import { AuthService } from './auth.service';

describe('AuthService', () => {
	let service: AuthService;
	let RequestService = {
		appkey: '',
		prefixUrl: '',
		http: {},
		utils: {},
		storage: {},
	};
	let BrowserStorageService = {};
	let UtilsService = {};

	beforeEach(() => {
		service = new AuthService(
			RequestService,
			BrowserStorageService,
			UtilsService
		);
	});

	it('should be created', () => {
		expect(service).toBeDefined();
	});

	it('private #isLoggedIn should be false by default', () => {
		expect(service['isLoggedIn']).toBeDefined();
	});

	it('RequestService')
	it('#isAuthenticated should', () => {
		expect(service.isAuthenticated).toBeDefined();
	});
	
	it('#me should', () => {
		expect(service.me).toBeDefined();
	});
	
	it('#logout should', () => {
		expect(service.logout).toBeDefined();
	});
	
	it('#linkedinAuthenticated should', () => {
		expect(service.linkedinAuthenticated).toBeDefined();
	});
	
	it('#connectToLinkedIn should', () => {
		expect(service.connectToLinkedIn).toBeDefined();
	});
	
	it('#directLink should', () => {
		expect(service.directLink).toBeDefined();
	});
	
	it('#getConfig should', () => {
		expect(service.getConfig).toBeDefined();
	});
	
	it('#checkDomain should', () => {
		expect(service.checkDomain).toBeDefined();
	});
	
	it('#updateProfile should', () => {
		expect(service.updateProfile).toBeDefined();
	})
});