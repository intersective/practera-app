import { environment } from '../../../environments/environment';
import type { UppyUploadSource } from './uppy-uploader.service';

// Fallbacks match tusd's defaults. OPTIONS supplies deployment overrides.
const DEFAULT_UPLOAD_BYTES: Record<UppyUploadSource, number> = {
  'user-profile': 8388608,
  chat: 26214400,
  assessment: 104857600,
  'media-manager': 524288000,
  static: 20971520,
  'project-hub': 104857600,
};

export function sourceUploadLimit(source: UppyUploadSource, deployedLimit?: number): number {
  const sourceLimit = Number.isSafeInteger(deployedLimit) && deployedLimit > 0
    ? deployedLimit : DEFAULT_UPLOAD_BYTES[source];
  if (!sourceLimit) throw new Error('Unsupported upload source.');
  const appLimit = environment.uppyConfig.restrictions.maxFileSize;
  return Number.isSafeInteger(appLimit) && appLimit > 0 ? Math.min(sourceLimit, appLimit) : sourceLimit;
}

export function formatUploadSize(bytes: number): string {
  if (bytes >= 1048576 && bytes % 1048576 === 0) return `${bytes / 1048576} MiB`;
  if (bytes >= 1024 && bytes % 1024 === 0) return `${bytes / 1024} KiB`;
  return `${bytes.toLocaleString('en-US')} ${bytes === 1 ? 'byte' : 'bytes'}`;
}
