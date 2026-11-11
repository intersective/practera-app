export type TopicAttentionConfidence = 'low' | 'medium' | 'high';

export interface TopicAttentionMetrics {
  version: 1;
  score: number;
  confidence: TopicAttentionConfidence;
  activeMs: number;
  visibleMs: number;
  estimatedReadMs: number;
  textWordCount: number;
  contentExposureRatio: number;
  mediaProgressRatio: number;
  mediaPlayedMs: number;
  filePreviewCount: number;
  fileDownloadCount: number;
  quickComplete: boolean;
}

export interface TopicAttentionSnapshotInput {
  activeMs: number;
  visibleMs: number;
  textWordCount: number;
  contentExposureRatio: number;
  mediaProgressRatio: number;
  mediaPlayedMs: number;
  filePreviewCount: number;
  fileDownloadCount: number;
  fileCount: number;
  hasMedia: boolean;
}

const READ_WORDS_PER_MINUTE = 200;
const QUICK_COMPLETE_MS = 5000;
const WEIGHTS = {
  textExposure: 0.35,
  readingTime: 0.25,
  mediaProgress: 0.25,
  fileInteraction: 0.15,
};

export function calculateEstimatedReadMs(textWordCount: number): number {
  if (!Number.isFinite(textWordCount) || textWordCount <= 0) {
    return 0;
  }

  return Math.ceil((textWordCount / READ_WORDS_PER_MINUTE) * 60000);
}

export function buildTopicAttentionMetrics(input: TopicAttentionSnapshotInput): TopicAttentionMetrics {
  const activeMs = normaliseMs(input.activeMs);
  const visibleMs = normaliseMs(input.visibleMs);
  const textWordCount = Math.max(0, Math.round(input.textWordCount || 0));
  const estimatedReadMs = calculateEstimatedReadMs(textWordCount);
  const fileCount = Math.max(0, Math.round(input.fileCount || 0));
  const filePreviewCount = Math.max(0, Math.round(input.filePreviewCount || 0));
  const fileDownloadCount = Math.max(0, Math.round(input.fileDownloadCount || 0));
  const contentExposureRatio = clampRatio(input.contentExposureRatio);
  const mediaProgressRatio = clampRatio(input.mediaProgressRatio);
  const mediaPlayedMs = normaliseMs(input.mediaPlayedMs);
  const quickComplete = activeMs < QUICK_COMPLETE_MS;

  const weightedSignals: Array<{ value: number; weight: number }> = [];
  if (textWordCount > 0) {
    weightedSignals.push({ value: contentExposureRatio, weight: WEIGHTS.textExposure });
    weightedSignals.push({
      value: estimatedReadMs > 0 ? clampRatio(activeMs / estimatedReadMs) : 0,
      weight: WEIGHTS.readingTime,
    });
  }

  if (input.hasMedia) {
    weightedSignals.push({ value: mediaProgressRatio, weight: WEIGHTS.mediaProgress });
  }

  if (fileCount > 0) {
    weightedSignals.push({
      value: clampRatio((filePreviewCount + fileDownloadCount) / fileCount),
      weight: WEIGHTS.fileInteraction,
    });
  }

  const totalWeight = weightedSignals.reduce((sum, signal) => sum + signal.weight, 0);
  const score = totalWeight > 0
    ? Math.round(weightedSignals.reduce((sum, signal) => sum + signal.value * signal.weight, 0) / totalWeight * 100)
    : 0;

  return {
    version: 1,
    score,
    confidence: calculateConfidence(score, quickComplete),
    activeMs,
    visibleMs,
    estimatedReadMs,
    textWordCount,
    contentExposureRatio: roundRatio(contentExposureRatio),
    mediaProgressRatio: roundRatio(mediaProgressRatio),
    mediaPlayedMs,
    filePreviewCount,
    fileDownloadCount,
    quickComplete,
  };
}

function calculateConfidence(score: number, quickComplete: boolean): TopicAttentionConfidence {
  if (quickComplete && score < 75) {
    return 'low';
  }

  if (score >= 75) {
    return 'high';
  }

  if (score >= 40) {
    return 'medium';
  }

  return 'low';
}

function clampRatio(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(1, Math.max(0, value));
}

function roundRatio(value: number): number {
  return Math.round(clampRatio(value) * 100) / 100;
}

function normaliseMs(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  return Math.round(value);
}
