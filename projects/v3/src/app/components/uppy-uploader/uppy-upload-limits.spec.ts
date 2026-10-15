import { fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { Uppy } from '@uppy/core';
import { environment } from '../../../environments/environment';
import { UppyUploaderService, UppyUploadSource } from './uppy-uploader.service';

describe('Upload size selection limits', () => {
  let service: UppyUploaderService;
  let uploaders: Uppy<any, any>[];
  let originalConfig: typeof environment.uppyConfig;
  let fetchSpy: jasmine.Spy;

  beforeEach(() => {
    originalConfig = environment.uppyConfig;
    environment.uppyConfig = {
      ...originalConfig,
      restrictions: {
        ...originalConfig.restrictions, maxFileSize: 2147483648,
        maxTotalFileSize: undefined, maxNumberOfFiles: 5,
      },
    };
    service = new UppyUploaderService(null!, {
      getUser: () => ({ apikey: 'synthetic-test-token' }), clearByName: () => undefined,
    } as any);
    uploaders = [];
    fetchSpy = spyOn(window, 'fetch').and.rejectWith(new Error('offline'));
  });

  afterEach(() => {
    uploaders.forEach(uppy => uppy.destroy());
    environment.uppyConfig = originalConfig;
  });

  function create(source: UppyUploadSource, maxFileSize?: number) {
    const uppy = service.createUppyInstance(source, 'https://upload.example.test/uploads/', undefined, { maxFileSize });
    uploaders.push(uppy);
    return uppy;
  }

  // Selection reads the File's size; size-only descriptors avoid allocating
  // hundreds of MiB for each boundary. No upload transport runs in these cases.
  function file(name: string, size: number) {
    return { name, type: 'application/pdf', data: { size, type: 'application/pdf' } as Blob };
  }

  for (const [source, bytes, label] of [
    ['user-profile', 8388608, '8 MiB'], ['chat', 26214400, '25 MiB'],
    ['assessment', 104857600, '100 MiB'], ['media-manager', 524288000, '500 MiB'],
    ['static', 20971520, '20 MiB'], ['project-hub', 104857600, '100 MiB'],
  ] as const) {
    it(`accepts the ${source} boundary and rejects larger selections with the allowed size`, () => {
      const uppy = create(source);
      uppy.addFile(file('at-limit.pdf', bytes));
      expect(() => uppy.addFile(file('too-large.pdf', bytes + 1))).toThrowError(/too-large.pdf/);
      expect(uppy.getFiles().map(item => item.name)).toEqual(['at-limit.pdf']);
      const message = uppy.getState().info.map(info => info.message).join(' ');
      expect(message).toContain(label);
      expect(message).toContain('Choose a smaller file');
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  }

  it('preserves valid selections when a batch contains an oversized file', () => {
    const uppy = create('chat');
    uppy.addFiles([file('valid.pdf', 10), file('too-large.pdf', 26214401)]);
    expect(uppy.getFiles().map(item => item.name)).toEqual(['valid.pdf']);
    expect(uppy.getState().info.some(info => info.message.includes('25 MiB'))).toBeTrue();
  });

  it('authenticates source discovery and applies a deployed override to selection', async () => {
    fetchSpy.and.resolveTo(new Response(null, { status: 200, headers: { 'Tus-Max-Size': '10' } }));
    const limit = await service.getUploadLimit('chat', 'https://upload.example.test/uploads/');
    expect(fetchSpy).toHaveBeenCalledWith('https://upload.example.test/uploads/', jasmine.objectContaining({
      method: 'OPTIONS', headers: jasmine.objectContaining({ apikey: 'synthetic-test-token', source: 'chat' }),
    }));
    const uppy = create('chat', limit);
    uppy.addFile(file('boundary.pdf', 10));
    expect(() => uppy.addFile(file('oversized.pdf', 11))).toThrowError(/10 bytes/);
    expect(uppy.getFiles().length).toBe(1);
  });

  it('keeps an existing lower app-wide limit when the server allows more', async () => {
    environment.uppyConfig.restrictions.maxFileSize = 5;
    fetchSpy.and.resolveTo(new Response(null, { status: 200, headers: { 'Tus-Max-Size': '10' } }));
    const uppy = create('chat', await service.getUploadLimit('chat', 'https://upload.example.test/uploads/'));
    expect(() => uppy.addFile(file('oversized.pdf', 6))).toThrowError(/5 bytes/);
  });

  for (const header of [null, '0', '-1', 'oops', '2.5', '9007199254740992']) {
    it(`falls back safely when the server size header is ${header}`, async () => {
      fetchSpy.and.resolveTo(new Response(null, { status: 200, headers: header === null ? {} : { 'Tus-Max-Size': header } }));
      const uppy = create('user-profile', await service.getUploadLimit('user-profile', 'https://upload.example.test/uploads/'));
      expect(() => uppy.addFile(file('oversized.pdf', 8388609))).toThrowError(/8 MiB/);
    });
  }

  it('falls back to the source default when discovery is offline', async () => {
    const uppy = create('chat', await service.getUploadLimit('chat', 'https://upload.example.test/uploads/'));
    expect(() => uppy.addFile(file('oversized.pdf', 26214401))).toThrowError(/25 MiB/);
  });

  it('ignores size headers on unsuccessful discovery responses', async () => {
    fetchSpy.and.resolveTo(new Response(null, { status: 403, headers: { 'Tus-Max-Size': '100' } }));
    const uppy = create('chat', await service.getUploadLimit('chat', 'https://upload.example.test/uploads/'));
    expect(() => uppy.addFile(file('oversized.pdf', 26214401))).toThrowError(/25 MiB/);
  });
  it('accepts a deployed limit above the default instead of retaining the default cap', async () => {
    fetchSpy.and.resolveTo(new Response(null, { status: 200, headers: { 'Tus-Max-Size': '52428800' } }));
    const uppy = create('chat', await service.getUploadLimit('chat', 'https://upload.example.test/uploads/'));
    uppy.addFile(file('larger-than-default.pdf', 26214401));
    expect(uppy.getFiles().length).toBe(1);
    expect(() => uppy.addFile(file('too-large.pdf', 52428801))).toThrowError(/50 MiB/);
  });

  it('falls back after a stalled discovery request without leaving the picker blocked', fakeAsync(() => {
    fetchSpy.and.callFake((_url: string, options: RequestInit) => new Promise((_resolve, reject) => {
      options.signal.addEventListener('abort', () => reject(new Error('aborted')));
    }));
    let limit: number;
    service.getUploadLimit('chat', 'https://upload.example.test/uploads/').then(value => { limit = value; });
    tick(4999);
    expect(limit).toBeUndefined();
    tick(1);
    flushMicrotasks();
    expect(limit).toBe(26214400);
  }));

});
