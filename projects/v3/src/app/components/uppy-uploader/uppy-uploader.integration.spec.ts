import { Uppy } from '@uppy/core';
import Tus from '@uppy/tus';
import { environment } from '../../../environments/environment';
import { UppyUploaderService } from './uppy-uploader.service';

// Only the HTTP transport is replaced: Uppy, its Tus plugin and tus-js-client run normally.
describe('Uppy uploader TUS request handling', () => {
  let originalConfig: typeof environment.uppyConfig;
  let originalStack: string;
  let uploaders: Uppy<any, any>[];
  let service: UppyUploaderService;
  const metadata = {
    bucket: 'test-bucket', path: 'files/p2-sandbox/user-profile/user/file',
    cdnUrl: 'https://files.example.test/files/profile',
    directUrl: 'https://upload.example.test/uploads/profile',
  };

  beforeEach(() => {
    originalConfig = environment.uppyConfig;
    originalStack = environment.stackName;
    environment.stackName = 'p2-sandbox';
    environment.uppyConfig = {
      ...originalConfig,
      restrictions: { ...originalConfig.restrictions, minFileSize: 0, maxNumberOfFiles: 1 },
    };
    uploaders = [];
    service = new UppyUploaderService(null!, {
      getUser: () => ({ apikey: 'synthetic-test-token' }), clearByName: () => ({}),
    } as any);
  });

  afterEach(() => {
    uploaders.forEach(uppy => uppy.destroy());
    environment.uppyConfig = originalConfig;
    environment.stackName = originalStack;
  });

  function response(status: number, headers: Record<string, string> = {}, body = '') {
    const values = Object.fromEntries(Object.entries(headers).map(([key,value]) => [key.toLowerCase(), value]));
    return {
      getStatus: () => status, getHeader: (name: string) => values[name.toLowerCase()] ?? null,
      getBody: () => body, getUnderlyingObject: () => ({ status, responseText: body }),
    };
  }

  function uploader(options: { size?: number; chunkSize?: number; postStatus?: number; patchStatus?: number; malformed?: boolean; resumeOffset?: number; omitResult?: boolean; emptyFinal?: boolean } = {}) {
    const requests: { method: string; headers: Record<string, string> }[] = [];
    const completedMetadata: any[] = [];
    const uploadSuccess = jasmine.createSpy('uploadSuccess');
    const errors: any[] = [];
    const size = options.size ?? 3;
    const uppy = service.createUppyInstance('user-profile', 'https://upload.example.test/uploads/', {
      onAfterResponse: (_req, res) => completedMetadata.push(service.parseTusUploadResponse(res.getBody())),
      onUploadSuccess: uploadSuccess,
    });
    uploaders.push(uppy);
    uppy.setOptions({ debug: false });
    uppy.on('upload-error', (_file, error) => errors.push(error));
    uppy.getPlugin<Tus<any, any>>('Tus')!.setOptions({
      retryDelays: [], chunkSize: options.chunkSize ?? Infinity,
      urlStorage: {
        findAllUploads: () => Promise.resolve([]), findUploadsByFingerprint: () => Promise.resolve(options.resumeOffset == null ? [] : [{
          uploadUrl: 'https://upload.example.test/uploads/test-upload', urlStorageKey: 'test-upload',
          size, metadata: {}, creationTime: new Date().toISOString(), parallelUploadUrls: null,
        }]),
        addUpload: () => Promise.resolve('test-upload'), removeUpload: () => Promise.resolve(),
      },
      httpStack: {
        getName: () => 'test transport',
        createRequest(method: string, url: string) {
          const headers: Record<string, string> = {};
          return {
            getMethod: () => method, getURL: () => url,
            getHeader: (name: string) => headers[name.toLowerCase()],
            setHeader: (name: string, value: string) => { headers[name.toLowerCase()] = value; },
            getUnderlyingObject: () => ({}), setProgressHandler: () => {}, abort: () => Promise.resolve(),
            send(body?: Blob) {
              requests.push({ method, headers });
              if (method === 'POST') {
                if (options.postStatus) return Promise.resolve(response(options.postStatus, {}, 'ERR_INVALID_SOURCE: invalid source request'));
                return Promise.resolve(response(201, { Location: '/uploads/test-upload', 'Upload-Offset': '0' }, size === 0 ? JSON.stringify(metadata) : ''));
              }
              if (method === 'HEAD') {
                return Promise.resolve(response(200, {
                  'Upload-Offset': String(options.resumeOffset), 'Upload-Length': String(size),
                  ...(options.resumeOffset === size && !options.omitResult ? { 'Upload-Result': JSON.stringify(metadata) } : {}),
                }));
              }
              if (method === 'PATCH') {
                if (options.patchStatus) return Promise.resolve(response(options.patchStatus, {}, 'Forbidden'));
                const offset = Number(headers['upload-offset']) + (body?.size ?? 0);
                const complete = offset === size;
                return Promise.resolve(response(complete ? 201 : 204, { 'Upload-Offset': String(offset) }, complete ? (options.emptyFinal ? '' : options.malformed ? '{invalid' : JSON.stringify(metadata)) : ''));
              }
              return Promise.reject(new Error(`Unexpected ${method}`));
            },
          } as any;
        },
      },
    });
    uppy.addFile({ name: 'profile.png', type: 'image/png', data: new Blob(['abc'.slice(0,size)], { type: 'image/png' }) });
    return { uppy, requests, completedMetadata, uploadSuccess, errors };
  }

  it('completes chunked uploads without parsing empty intermediate PATCH responses', async () => {
    const flow = uploader({ chunkSize: 1 });
    const result = await flow.uppy.upload();
    expect(result.failed.length).toBe(0);
    expect(result.successful.length).toBe(1);
    expect(flow.requests.map(req => req.method)).toEqual(['POST', 'PATCH', 'PATCH', 'PATCH']);
    expect(flow.completedMetadata).toEqual([metadata]);
    expect(flow.uploadSuccess).toHaveBeenCalledTimes(1);
  });

  it('delivers completion metadata when a zero-byte file completes in POST', async () => {
    const flow = uploader({ size: 0 });
    const result = await flow.uppy.upload();
    expect(result.successful.length).toBe(1);
    expect(flow.requests.map(req => req.method)).toEqual(['POST']);
    expect(flow.completedMetadata).toEqual([metadata]);
  });

  it('recovers completed upload metadata from HEAD without sending the file again', async () => {
    const flow = uploader({ resumeOffset: 3 });
    const result = await flow.uppy.upload();
    expect(result.failed.length).toBe(0);
    expect(result.successful.length).toBe(1);
    expect(flow.requests.map(req => req.method)).toEqual(['HEAD']);
    expect(flow.completedMetadata).toEqual([metadata]);
    expect(flow.uploadSuccess).toHaveBeenCalledTimes(1);
  });

  it('does not report success when completed HEAD lacks required file metadata', async () => {
    const flow = uploader({ resumeOffset: 3, omitResult: true });
    const result = await flow.uppy.upload();
    expect(result.failed.length).toBe(1);
    expect(flow.uploadSuccess).not.toHaveBeenCalled();
  });

  it('resumes incomplete uploads without requiring completion metadata on HEAD', async () => {
    const flow = uploader({ resumeOffset: 1 });
    const result = await flow.uppy.upload();
    expect(result.failed.length).toBe(0);
    expect(result.successful.length).toBe(1);
    expect(flow.requests.map(req => req.method)).toEqual(['HEAD', 'PATCH']);
    expect(flow.completedMetadata).toEqual([metadata]);
  });

  it('preserves PATCH authentication errors instead of reporting invalid metadata', async () => {
    const flow = uploader({ patchStatus: 403 });
    const result = await flow.uppy.upload();
    expect(result.failed.length).toBe(1);
    expect(flow.errors[0].originalResponse?.getStatus()).toBe(403);
    expect(flow.completedMetadata).toEqual([]);
    expect(flow.uploadSuccess).not.toHaveBeenCalled();
  });

  it('preserves invalid-source HTTP 400 responses without retrying', async () => {
    const flow = uploader({ postStatus: 400 });
    const result = await flow.uppy.upload();
    expect(result.failed.length).toBe(1);
    expect(flow.errors[0].originalResponse?.getStatus()).toBe(400);
    expect(flow.requests.map(req => req.method)).toEqual(['POST']);
    expect(flow.uploadSuccess).not.toHaveBeenCalled();
  });

  it('rejects malformed final metadata before notifying successful completion', async () => {
    const flow = uploader({ malformed: true });
    const result = await flow.uppy.upload();
    expect(result.failed.length).toBe(1);
    expect(flow.uploadSuccess).not.toHaveBeenCalled();
  });

  it('does not report success when the final PATCH body is empty', async () => {
    const flow = uploader({ emptyFinal: true });
    const result = await flow.uppy.upload();
    expect(result.failed.length).toBe(1);
    expect(flow.uploadSuccess).not.toHaveBeenCalled();
  });

  it('rejects file-type labels as server upload categories before starting requests', () => {
    expect(() => service.createUppyInstance('image' as any, 'https://upload.example.test/uploads/'))
      .toThrowError('Unsupported upload source.');
  });

  it('authenticates every chunk without sending client identity headers', async () => {
    const flow = uploader();
    await flow.uppy.upload();
    expect(flow.requests.length).toBe(2);
    flow.requests.forEach(req => {
      expect(req.headers['apikey']).toBe('synthetic-test-token');
      expect(req.headers['stackname']).toBe('p2-sandbox');
      expect(req.headers['source']).toBe('user-profile');
      expect(req.headers['user-uuid']).toBeUndefined();
      expect(req.headers['institution-uuid']).toBeUndefined();
      expect(req.headers['experience-uuid']).toBeUndefined();
    });
  });
});
