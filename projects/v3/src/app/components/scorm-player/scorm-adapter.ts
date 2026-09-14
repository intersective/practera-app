/**
 * ScormAdapter — implements SCORM 1.2 (window.API) and SCORM 2004 (window.API_1484_11)
 * LMS-side adapter. Translates CMI data model to xAPI statements.
 *
 * When the SCO calls LMSCommit/Commit, staged xAPI statements are dispatched
 * via window.postMessage with type='scormXapiStatements' for the Angular layer
 * to send to the GraphQL LRS.
 *
 * CMI→xAPI mappings:
 *   lesson_status=completed   → verb:completed
 *   lesson_status=passed      → verb:passed
 *   lesson_status=failed      → verb:failed
 *   score.raw                 → result.score.raw (0-100)
 *   score.scaled              → result.score.scaled (-1 to 1)
 *   session_time              → result.duration (ISO 8601)
 *   interactions.n.*          → verb:interacted sub-statements
 *   suspend_data              → postMessage type='scormSuspendData'
 */

export interface ScormAdapterOptions {
  version: 'scorm12' | 'scorm2004';
  masteryScore: number;
  allowResume: boolean;
  assessmentId?: number;
  activityId: string;
}

export class ScormAdapter {
  private cmi: Record<string, string> = {};
  private initialized = false;
  private finished = false;
  private lastError = '0';
  private opts: ScormAdapterOptions;
  private stagedStatements: Record<string, any>[] = [];

  constructor(opts: ScormAdapterOptions) {
    this.opts = opts;
    // Pre-populate with defaults
    this.cmi['cmi.core.student_id'] = '';
    this.cmi['cmi.core.student_name'] = '';
    this.cmi['cmi.core.lesson_status'] = 'not attempted';
    this.cmi['cmi.core.score.raw'] = '';
    this.cmi['cmi.core.score.min'] = '0';
    this.cmi['cmi.core.score.max'] = '100';
    this.cmi['cmi.core.session_time'] = '0000:00:00.00';
    this.cmi['cmi.core.exit'] = '';
    this.cmi['cmi.suspend_data'] = '';
    this.cmi['cmi.launch_data'] = '';
    this.cmi['cmi.completion_status'] = 'unknown';
    this.cmi['cmi.success_status'] = 'unknown';
    this.cmi['cmi.score.scaled'] = '';
    this.cmi['cmi.score.raw'] = '';
    this.cmi['cmi.score.min'] = '0';
    this.cmi['cmi.score.max'] = '100';
    this.cmi['cmi.session_time'] = 'PT0S';
    this.cmi['cmi.exit'] = '';
  }

  getApi12() {
    const self = this;
    return {
      LMSInitialize: (_: string) => { self.initialize(); return 'true'; },
      LMSFinish: (_: string) => { self.finish(); return 'true'; },
      LMSGetValue: (e: string) => self.getValue(e),
      LMSSetValue: (e: string, v: string) => { self.setValue(e, v); return 'true'; },
      LMSCommit: (_: string) => { self.commit(); return 'true'; },
      LMSGetLastError: () => self.lastError,
      LMSGetErrorString: (code: string) => self.getErrorString(code),
      LMSGetDiagnostic: (code: string) => code,
    };
  }

  getApi2004() {
    const self = this;
    return {
      Initialize: (_: string) => { self.initialize(); return 'true'; },
      Terminate: (_: string) => { self.finish(); return 'true'; },
      GetValue: (e: string) => self.getValue(e),
      SetValue: (e: string, v: string) => { self.setValue(e, v); return 'true'; },
      Commit: (_: string) => { self.commit(); return 'true'; },
      GetLastError: () => self.lastError,
      GetErrorString: (code: string) => self.getErrorString(code),
      GetDiagnostic: (code: string) => code,
    };
  }

  private initialize(): void {
    this.initialized = true;
    this.lastError = '0';
    // Emit initialized statement
    this.stagedStatements.push(this.makeStatement('http://adlnet.gov/expapi/verbs/initialized', null));
  }

  finish(): void {
    if (!this.initialized || this.finished) return;
    this.finished = true;
    this.commit();
    // Emit terminated statement
    this.postStatements([this.makeStatement('http://adlnet.gov/expapi/verbs/terminated', this.buildResult())]);
  }

  private getValue(element: string): string {
    return this.cmi[element] ?? '';
  }

  private setValue(element: string, value: string): void {
    this.cmi[element] = value;
    this.lastError = '0';

    // Capture suspend_data changes immediately
    if (element === 'cmi.suspend_data' || element === 'cmi.core.suspend_data') {
      window.postMessage({
        type: 'scormSuspendData',
        stateId: 'cmi.suspend_data',
        document: { value, timestamp: new Date().toISOString() },
      }, '*');
    }
  }

  private commit(): void {
    const result = this.buildResult();

    const status = this.getLessonStatus();
    const verbMap: Record<string, string> = {
      completed: 'http://adlnet.gov/expapi/verbs/completed',
      passed: 'http://adlnet.gov/expapi/verbs/passed',
      failed: 'http://adlnet.gov/expapi/verbs/failed',
      browsed: 'http://adlnet.gov/expapi/verbs/experienced',
      incomplete: 'http://adlnet.gov/expapi/verbs/progressed',
    };

    if (status && verbMap[status]) {
      this.stagedStatements.push(this.makeStatement(verbMap[status], result));

      // Notify Angular layer on completion/pass
      if (status === 'completed' || status === 'passed') {
        const score = result?.score?.raw ?? null;
        window.postMessage({
          type: 'scormCompleted',
          taskId: (window as any).__scormTaskId__,
          score,
        }, '*');
      }
    }

    if (this.stagedStatements.length > 0) {
      this.postStatements([...this.stagedStatements]);
      this.stagedStatements = [];
    }
  }

  private getLessonStatus(): string {
    return (
      this.cmi['cmi.core.lesson_status'] ||
      this.cmi['cmi.completion_status'] ||
      this.cmi['cmi.success_status'] ||
      ''
    );
  }

  private buildResult(): Record<string, any> | null {
    const rawScore = parseFloat(this.cmi['cmi.core.score.raw'] || this.cmi['cmi.score.raw'] || '');
    const scaledScore = parseFloat(this.cmi['cmi.score.scaled'] || '');
    const sessionTime = this.cmi['cmi.core.session_time'] || this.cmi['cmi.session_time'] || '';
    const status = this.getLessonStatus();

    const result: Record<string, any> = {};

    if (!isNaN(rawScore)) {
      result.score = {
        raw: rawScore,
        scaled: !isNaN(scaledScore) ? scaledScore : rawScore / 100,
        min: parseFloat(this.cmi['cmi.core.score.min'] || this.cmi['cmi.score.min'] || '0'),
        max: parseFloat(this.cmi['cmi.core.score.max'] || this.cmi['cmi.score.max'] || '100'),
      };
    }

    if (status === 'completed' || status === 'passed') result.completion = true;
    if (status === 'passed') result.success = true;
    if (status === 'failed') result.success = false;
    if (sessionTime) result.duration = scormTimeToDuration(sessionTime);

    return Object.keys(result).length > 0 ? result : null;
  }

  private makeStatement(verbId: string, result: Record<string, any> | null): Record<string, any> {
    return {
      actor: { objectType: 'Agent', mbox: 'mailto:learner@practera.com' }, // replaced by server
      verb: { id: verbId, display: { 'en-US': verbId.split('/').pop() ?? verbId } },
      object: { id: this.opts.activityId, objectType: 'Activity' },
      ...(result ? { result } : {}),
      timestamp: new Date().toISOString(),
    };
  }

  private postStatements(statements: Record<string, any>[]): void {
    window.postMessage({
      type: 'scormXapiStatements',
      statements,
      assessmentId: this.opts.assessmentId,
      activitySource: this.opts.version,
    }, '*');
  }

  private getErrorString(code: string): string {
    const errors: Record<string, string> = {
      '0': 'No Error', '101': 'General Exception', '201': 'Invalid Argument Error',
      '202': 'Element Cannot Have Children', '203': 'Element Not An Array',
      '301': 'Not Initialized', '401': 'Not Implemented Error',
      '402': 'Invalid Set Value', '403': 'Element Is Read Only',
      '404': 'Element Is Write Only', '405': 'Incorrect Data Type',
    };
    return errors[code] ?? 'Unknown Error';
  }
}

function scormTimeToDuration(scormTime: string): string {
  // SCORM 1.2: HH:MM:SS.SS or HHHH:MM:SS.SS → ISO 8601 PT#H#M#S
  // SCORM 2004: already ISO 8601 PTxHxMxS
  if (scormTime.startsWith('PT')) return scormTime;
  const parts = scormTime.split(':');
  if (parts.length === 3) {
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const s = parseFloat(parts[2]);
    return `PT${h > 0 ? `${h}H` : ''}${m > 0 ? `${m}M` : ''}${s > 0 ? `${s}S` : ''}` || 'PT0S';
  }
  return 'PT0S';
}
