import { UtilsService } from './utils.service';

describe('UtilsService', () => {
	let service: UtilsService;
	beforeEach(() => {
		service = new UtilsService();
	});

	it('has lodash instantiated', () => {
		expect(service).toBeDefined();
	});
});