import { UtilsService } from './utils.service';

describe('UtilsService', () => {
	let service: UtilsService;
	let modalController = null;
	beforeEach(() => {
		service = new UtilsService(modalController);
	});

	it('has lodash instantiated', () => {
		expect(service).toBeDefined();
	});
});