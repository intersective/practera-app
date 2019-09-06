import { UtilsService } from './utils.service';

describe('UtilsService', () => {
  let service: UtilsService;
  const modalController = null;
  beforeEach(() => {
    service = new UtilsService(modalController);
  });

  it('has lodash instantiated', () => {
    // expect(service).toBeDefined();
  });
});
