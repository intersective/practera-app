import { buildTopicAttentionMetrics, calculateEstimatedReadMs } from './topic-attention.model';

describe('Topic attention metrics', () => {
  it('scores text-only attention from exposure and reading time', () => {
    const metrics = buildTopicAttentionMetrics({
      activeMs: 60000,
      visibleMs: 60000,
      textWordCount: 200,
      contentExposureRatio: 1,
      mediaProgressRatio: 0,
      mediaPlayedMs: 0,
      filePreviewCount: 0,
      fileDownloadCount: 0,
      fileCount: 0,
      hasMedia: false,
    });

    expect(metrics.estimatedReadMs).toBe(60000);
    expect(metrics.score).toBe(100);
    expect(metrics.confidence).toBe('high');
  });

  it('keeps quick text completion low confidence unless the score is high', () => {
    const metrics = buildTopicAttentionMetrics({
      activeMs: 1000,
      visibleMs: 1000,
      textWordCount: 100,
      contentExposureRatio: 1,
      mediaProgressRatio: 0,
      mediaPlayedMs: 0,
      filePreviewCount: 0,
      fileDownloadCount: 0,
      fileCount: 0,
      hasMedia: false,
    });

    expect(metrics.score).toBe(60);
    expect(metrics.quickComplete).toBeTrue();
    expect(metrics.confidence).toBe('low');
  });

  it('scores media-only topics from media progress', () => {
    const metrics = buildTopicAttentionMetrics({
      activeMs: 20000,
      visibleMs: 20000,
      textWordCount: 0,
      contentExposureRatio: 0,
      mediaProgressRatio: 0.8,
      mediaPlayedMs: 16000,
      filePreviewCount: 0,
      fileDownloadCount: 0,
      fileCount: 0,
      hasMedia: true,
    });

    expect(metrics.score).toBe(80);
    expect(metrics.confidence).toBe('high');
  });

  it('redistributes mixed-topic weights across applicable signals', () => {
    const metrics = buildTopicAttentionMetrics({
      activeMs: 30000,
      visibleMs: 30000,
      textWordCount: 200,
      contentExposureRatio: 0.5,
      mediaProgressRatio: 0.75,
      mediaPlayedMs: 12000,
      filePreviewCount: 1,
      fileDownloadCount: 0,
      fileCount: 1,
      hasMedia: true,
    });

    expect(metrics.score).toBe(64);
    expect(metrics.confidence).toBe('medium');
  });

  it('scores file-only topics from file interactions', () => {
    const metrics = buildTopicAttentionMetrics({
      activeMs: 10000,
      visibleMs: 10000,
      textWordCount: 0,
      contentExposureRatio: 0,
      mediaProgressRatio: 0,
      mediaPlayedMs: 0,
      filePreviewCount: 0,
      fileDownloadCount: 1,
      fileCount: 2,
      hasMedia: false,
    });

    expect(metrics.score).toBe(50);
    expect(metrics.confidence).toBe('medium');
  });

  it('returns low confidence when no signals apply', () => {
    const metrics = buildTopicAttentionMetrics({
      activeMs: 10000,
      visibleMs: 10000,
      textWordCount: 0,
      contentExposureRatio: 0,
      mediaProgressRatio: 0,
      mediaPlayedMs: 0,
      filePreviewCount: 0,
      fileDownloadCount: 0,
      fileCount: 0,
      hasMedia: false,
    });

    expect(metrics.score).toBe(0);
    expect(metrics.confidence).toBe('low');
  });

  it('estimates reading time at 200 words per minute', () => {
    expect(calculateEstimatedReadMs(100)).toBe(30000);
  });
});
