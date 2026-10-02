import type { BrowserContext, Request } from '@playwright/test';

// WebKit does not expose Blob request bodies through its network protocol.
// https://github.com/microsoft/playwright/issues/6479
// Observe the original body and delegate to native send with unchanged arguments/result.
type ObservedWindow = Window & { __e2eUploadBodies?: Map<string, Blob[]> };

export async function observeWebKitUploadBodies(context: BrowserContext) {
  if (context.browser()?.browserType().name() !== 'webkit') return;
  await context.addInitScript(() => {
    const bodies = new Map<string, Blob[]>();
    (window as ObservedWindow).__e2eUploadBodies = bodies;
    const requests = new WeakMap<XMLHttpRequest, { method: string; url: string }>();
    const open = XMLHttpRequest.prototype.open;
    const send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...args: unknown[]) {
      requests.set(this, { method: method.toUpperCase(), url: new URL(url, location.href).href });
      return Reflect.apply(open, this, [method, url, ...args]);
    };
    XMLHttpRequest.prototype.send = function(body?: Document | XMLHttpRequestBodyInit | null) {
      const request = requests.get(this);
      if (request?.method === 'PATCH' && request.url.startsWith('https://upload.e2e.invalid/uploads/') && body instanceof Blob) {
        const pending = bodies.get(request.url) || [];
        pending.push(body);
        bodies.set(request.url, pending);
      }
      return Reflect.apply(send, this, [body]);
    };
  });
}

export async function uploadBody(request: Request): Promise<Buffer | null> {
  const body = request.postDataBuffer();
  if (body !== null) return body;
  const bytes = await request.frame().evaluate(async url => {
    const blob = (window as ObservedWindow).__e2eUploadBodies?.get(url)?.shift();
    return blob ? Array.from(new Uint8Array(await blob.arrayBuffer())) : null;
  }, request.url());
  return bytes === null ? null : Buffer.from(bytes);
}
