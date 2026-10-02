import { test as base, expect, type Page } from '@playwright/test';
import { parse, Kind, type SelectionSetNode } from 'graphql';
import { advancedGroups, defaultOptions, feedbackQuestions, uploadMetadata, type AdvancedOptions } from './advanced-fixtures';
import { observeWebKitUploadBodies, uploadBody } from './upload-observer';
import { actors, moderationGroups, moderationTodoItems, type ModerationState } from './moderation-fixtures';

export const names = { first: 'E2E Design Program', second: 'E2E Research Program', activity: 'E2E Learning Activity', topic: 'E2E Reading Topic', assessment: 'E2E Reflection' };
export const token = 'e2e-synthetic-learner-token';
const experience = (second = false) => ({
  id: second ? 2 : 1, uuid: second ? 'e2e-exp-2' : 'e2e-exp-1', timelineId: second ? 22 : 11,
  projectId: second ? 202 : 101, name: second ? names.second : names.first, description: 'A synthetic learning program.',
  type: 'experience', leadImage: '/assets/default-experience-image.svg', status: 'active', setupStep: 0,
  color: '#006699', secondaryColor: '#669900', todoItemCount: 0, role: 'participant', isLast: true,
  locale: 'en-US', supportName: 'Coordinator', supportEmail: 'help@example.invalid', cardUrl: '', bannerUrl: '',
  logoUrl: '', iconUrl: '', reviewRating: false, truncateDescription: true,
  team: null, featureToggle: { pulseCheckIndicator: false, showProjectHub: false },
});
export interface MockState {
  moderation?: ModerationState;
  options: AdvancedOptions; reviewAnswers: Record<number, { answer?: unknown; comment?: string; file?: unknown }>;
  reviewDone: boolean; pulseSubmitted: boolean; pulseSubmissions: Array<Record<string, unknown>>;
  profileAvatar?: Record<string, unknown>; uploads: Array<{ length: number; offset: number; source: string; metadata: typeof uploadMetadata }>;
  uploadRequests: Array<{ method: string; path: string }>; files: Record<number, unknown>;
  answers: Record<number, unknown>; submitted: boolean; submitCount: number;
  failSave: boolean; failSubmit: boolean; failures: string[]; warnings: string[];
  submissions: Array<Record<string, unknown>>; operations: Array<{ name: string; fields: string[]; variables: Record<string, unknown> }>;
}
export function newState(): MockState {
  return { options: { ...defaultOptions }, reviewAnswers: {}, reviewDone: false, pulseSubmitted: false,
    pulseSubmissions: [], uploads: [], uploadRequests: [], files: {}, answers: {}, submitted: false, submitCount: 0, failSave: false, failSubmit: false, failures: [], warnings: [], submissions: [], operations: [] };
}
const questions = () => Array.from({ length: 11 }, (_, i) => ({
  id: i + 1, name: i === 0 ? 'Your reflection' : i === 1 ? 'Choose one approach' : i === 2 ? 'Choose useful skills' : `Reflection ${i + 1}`,
  description: '', type: i === 1 ? 'oneof' : i === 2 ? 'multiple' : 'text',
  isRequired: [0, 1, 2, 10].includes(i), hasComment: false, audience: ['submitter'], fileType: null,
  min: null, max: null, choices: i === 1 || i === 2 ? [
    { id: i === 1 ? 11 : 21, name: 'Research', explanation: '', description: '' }, { id: i === 1 ? 12 : 22, name: 'Design', explanation: '', description: '' },
  ] : [], teamMembers: [],
}));
function projectSelection(value: any, set?: SelectionSetNode): any {
  if (value == null || !set) return value;
  if (Array.isArray(value)) return value.map(item => projectSelection(item, set));
  return Object.fromEntries(set.selections.filter(s => s.kind === Kind.FIELD).map(field => [
    field.alias?.value || field.name.value,
    field.name.value === '__typename' ? (value.__typename || 'Fixture') : projectSelection(value[field.name.value] ?? null, field.selectionSet),
  ]));
}
export async function installMockAPI(page: Page, state: MockState) {
  const context = page.context();
  await observeWebKitUploadBodies(context);
  await context.routeWebSocket(/.*/, socket => socket.close());
  await context.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    const moderation = state.options.scenario === 'moderation' ? state.moderation : undefined;
    const actor = moderation ? actors[state.options.role] : actors.participant;
    if (url.origin === 'http://localhost:4300') return route.continue();
    if (url.hostname === 'login.e2e.invalid') {
      return route.fulfill({ contentType: 'text/html', body: '<!doctype html><html><body><h1>Global login handoff</h1></body></html>' });
    }
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') return route.fulfill({ contentType: 'text/css', body: '' });
    if (url.hostname === 'ipapi.co') return route.fulfill({ json: { country_code: 'AU' } });
    if (url.hostname === 'upload.e2e.invalid') {
      const cors = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'POST, PATCH, HEAD, OPTIONS, GET',
        'access-control-allow-headers': 'apikey, source, stackName, Tus-Resumable, Upload-Length, Upload-Metadata, Upload-Offset, Content-Type, X-HTTP-Method-Override',
        'access-control-expose-headers': 'Location, Tus-Resumable, Upload-Offset, Upload-Length', 'tus-resumable': '1.0.0' };
      const method = request.method();
      if (method === 'GET' && ['/cdn/evidence.mp4', '/direct/evidence.mp4'].includes(url.pathname)) {
        return route.fulfill({ headers: cors, contentType: 'video/mp4', body: Buffer.from('Synthetic video evidence') });
      }
      if (method === 'GET' && ['/cdn/evidence.png', '/direct/evidence.png'].includes(url.pathname)) {
        return route.fulfill({ headers: cors, contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j7l8AAAAASUVORK5CYII=', 'base64') });
      }
      if (method === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
      state.uploadRequests.push({ method, path: url.pathname });
      const source = request.headers().source;
      if (request.headers().apikey !== actor.token || request.headers().stackname !== 'e2e' || !['assessment', 'user-profile'].includes(source)) {
        state.failures.push('Unexpected upload authentication/source'); return route.abort();
      }
      if (method === 'POST' && url.pathname === '/uploads/') {
        const length = Number(request.headers()['upload-length']);
        if (!(length > 0)) { state.failures.push('Missing upload length'); return route.abort(); }
        const filename = (request.headers()['upload-metadata'] || '').split(',').find(item => item.trim().startsWith('name '));
        const video = filename && Buffer.from(filename.trim().slice(5), 'base64').toString().endsWith('.mp4');
        const metadata = video ? { bucket: 'e2e-bucket', path: 'e2e/evidence.mp4',
          cdnUrl: 'https://upload.e2e.invalid/cdn/evidence.mp4', directUrl: 'https://upload.e2e.invalid/direct/evidence.mp4' } : uploadMetadata;
        state.uploads.push({ length, offset: 0, source, metadata });
        return route.fulfill({ status: 201, headers: { ...cors, location: `https://upload.e2e.invalid/uploads/${state.uploads.length}` } });
      }
      const upload = state.uploads[Number(url.pathname.split('/').pop()) - 1];
      if (!upload || !url.pathname.startsWith('/uploads/')) { state.failures.push('Unexpected upload identifier'); return route.abort(); }
      if (method === 'HEAD') return route.fulfill({ status: 200, headers: { ...cors, 'upload-offset': String(upload.offset), 'upload-length': String(upload.length) } });
      if (method === 'PATCH') {
        if (Number(request.headers()['upload-offset']) !== upload.offset) { state.failures.push('Unexpected upload offset'); return route.abort(); }
        upload.offset += (await uploadBody(request))?.length || 0;
        if (upload.offset !== upload.length) { state.failures.push('Unexpected upload bytes'); return route.abort(); }
        return route.fulfill({ status: 200, headers: { ...cors, 'upload-offset': String(upload.offset) }, json: upload.metadata });
      }
      state.failures.push(`Unexpected upload method: ${method}`); return route.abort();
    }
    if (url.hostname !== 'graphql.e2e.invalid') {
      state.failures.push(`Unexpected external request: ${url.origin}${url.pathname}`);
      return route.abort();
    }
    const body = request.postDataJSON();
    const document = parse(body.query);
    const operation = document.definitions.find(definition => definition.kind === Kind.OPERATION_DEFINITION);
    if (!operation || operation.kind !== Kind.OPERATION_DEFINITION) throw new Error('Expected GraphQL operation');
    const fields = operation.selectionSet.selections.filter(s => s.kind === Kind.FIELD).map(f => f.name.value);
    const vars = body.variables || {};
    state.operations.push({ name: body.operationName || '(anonymous)', fields, variables: vars });
    const second = vars.experienceUuid === 'e2e-exp-2' || request.headers().timelineid === '22';
    const todoItems = moderation ? moderationTodoItems(moderation.stage, state.options.role) : [];
    const exp = { ...experience(second), role: state.options.role, todoItemCount: todoItems.length,
      team: state.options.team ? { id: 2001, name: 'E2E Team', uuid: 'e2e-team', projectBrief: null } : null };
    const fixtureGroups = (moderation ? moderationGroups() : advancedGroups(state.options.scenario)) || [{ name: 'Reflection questions', description: '', questions: questions() }];
    const fixtureQuestions = fixtureGroups.flatMap(group => group.questions);
    const status = moderation ? (moderation.stage === 'draft' ? 'in progress'
      : ['published', 'read'].includes(moderation.stage) ? 'published' : 'pending review')
      : state.options.status || (state.submitted ? 'done' : 'in progress');
    const assessmentType = state.options.scenario === 'team360' ? 'team360' : ['roles', 'role-pages', 'moderation'].includes(state.options.scenario) ? 'moderated' : 'standard';
    const isTeamAssessment = state.options.locked && state.options.team;
    const reviewDone = moderation ? ['published', 'read'].includes(moderation.stage) : state.reviewDone;
    const hasReview = moderation ? ['assigned', 'published', 'read'].includes(moderation.stage) : ['roles', 'role-pages'].includes(state.options.scenario);
    const review = hasReview ? { id: 1001, status: reviewDone ? 'done' : 'in progress',
      modified: '2026-10-02T00:00:00Z', meta: {}, reviewer: { name: 'E2E Reviewer' },
      answers: Object.entries(state.reviewAnswers).map(([id, answer]) => ({ questionId: Number(id), ...answer, file: answer.file || null })) } : null;
    if (fields.includes('auth') && request.headers().apikey === 'e2e-invalid-token') {
      return route.fulfill({ status: 401, json: { errors: [{ message: 'Invalid learner token' }] } });
    }
    const activity = { id: 301, name: second ? 'E2E Research Activity' : names.activity, description: 'Practice a complete learning journey.', isLocked: false, leadImage: '', unlockConditions: [], tasks: [
      { id: 401, name: names.topic, type: 'Topic', isLocked: false, isTeam: false, deadline: null, contextId: 601, assessmentType: null, status: { status: 'in progress', isLocked: false, submitterName: null, submitterImage: null } },
      { id: 501, name: names.assessment, type: 'Assessment', isLocked: false, isTeam: isTeamAssessment, deadline: null, contextId: 601, assessmentType, status: { status, isLocked: false, submitterName: null, submitterImage: null } },
    ] };
    const roots: Record<string, any> = {
      auth: { apikey: actor.token, experience: exp, email: actor.email, unregistered: false, activationCode: null },
      experiences: [experience(), experience(true)].map(item => moderation ? { ...item, role: state.options.role, todoItemCount: todoItems.length } : item), projects: [101, 202].map(id => ({ id, progress: 0 })),
      user: { id: actor.id, uuid: moderation ? `e2e-user-${actor.id}` : 'e2e-user', name: actor.name, firstName: 'E2E', lastName: moderation && state.options.role === 'mentor' ? 'Reviewer' : 'Learner', avatar: state.profileAvatar?.url || '/assets/logo.svg', email: actor.email, image: state.profileAvatar?.url || '/assets/logo.svg', role: state.options.role, hasReviewRating: false, contactNumber: '', userHash: '', teams: exp.team ? [exp.team] : [] },
      experience: exp, milestones: [{ id: 801, name: 'Learning milestone', description: '', isLocked: false, unlockConditions: [], activities: [{ ...activity, description: second ? 'Research program activity' : 'Design program activity' }] }],
      project: { id: exp.projectId, progress: 0, todoItems, milestones: [{ id: 801, progress: 0, unlockConditions: [], activities: [{ id: 301, progress: 0 }] }] },
      events: [], reviews: state.options.role === 'mentor' && (!moderation || hasReview) ? [{ id: 1001, isDone: reviewDone, modifiedDate: '2026-10-02T00:00:00Z', createdDate: '2026-10-02T00:00:00Z', status: review?.status, assessment: { id: 501, name: names.assessment }, submission: { id: 901, contextId: 601, submitter: { name: 'E2E Learner' }, team: { name: 'E2E Team' } } }] : [], channels: [], notificationChannel: null, achievements: [], badges: [], pulseCheckSkills: [],
      pulseCheckStatus: {}, pulseCheck: state.submitted && !state.pulseSubmitted && state.options.feedback !== 'none' ? { questions: feedbackQuestions, meta: state.options.feedback === 'missing-meta' ? null : { contextId: 601, teamId: 2001, teamName: 'E2E Team', targetUserId: null, assessmentName: names.assessment } } : { questions: [] },
      activity,
      topic: { id: 401, title: names.topic, content: '<p>Read this synthetic topic before completing your reflection.</p>', videolink: '', files: [], audio: null },
      assessment: { id: 501, name: names.assessment, type: assessmentType, description: 'Reflect on your learning.', dueDate: null, isTeam: isTeamAssessment, pulseCheck: state.options.feedback !== 'none', hasReviewRating: false, allowResubmit: false,
        groups: fixtureGroups,
        submissions: [{ id: 901, status, completed: moderation ? moderation.stage === 'read' : state.submitted, modified: '2026-10-02T00:00:00Z', locked: state.options.locked,
          submitter: { name: state.options.locked ? 'E2E Peer A' : 'E2E Learner', image: '/assets/logo.svg', team: isTeamAssessment ? exp.team : null }, review,
          answers: [...Object.entries(state.answers).map(([id, answer]) => ({ questionId: Number(id), answer, file: null })), ...Object.entries(state.files).map(([id, file]) => ({ questionId: Number(id), answer: null, file }))] }] },
      updateProgress: { success: true, message: 'Updated' },
    };
    if (state.options.locks !== 'none') {
      const linked = [
        { name: names.topic, action: 'complete', meta: { activityId: 301, topicId: 401 } },
        { name: names.assessment, action: 'submit', meta: { contextId: 601, activityId: 301, assessmentId: 501 } },
      ];
      const unsupported = { name: 'Coordinator-defined score', action: 'score', meta: null };
      const conditions = state.options.locks === 'linked' ? linked : state.options.locks === 'mixed' ? [linked[0], unsupported]
        : state.options.locks === 'missing' ? [{ ...linked[1], meta: { activityId: 301 } }] : [unsupported];
      roots.milestones[0].activities.push({ id: 302, name: 'E2E Locked Activity', isLocked: true, description: '', leadImage: '', unlockConditions: conditions });
      roots.milestones.push({ id: 802, name: 'E2E Locked Milestone', description: '', isLocked: true, unlockConditions: conditions, activities: [] });
      roots.project.milestones[0].activities.push({ id: 302, progress: 0 });
      roots.project.milestones.push({ id: 802, progress: 0, unlockConditions: [], activities: [] });
    }
    try {
      if (moderation && request.headers().apikey !== actor.token) throw new Error('Unexpected moderation actor token');
      if (moderation?.failTodoRefresh && moderation.stage === 'published'
        && fields.length === 1 && fields[0] === 'project') {
        moderation.failTodoRefresh = false;
        return route.fulfill({ status: 503, json: { errors: [{ message: 'Temporary notification refresh failure' }] } });
      }
      function validateModeratedAnswer(input: Record<string, any>, audience: 'submitter' | 'reviewer') {
        const question = fixtureQuestions.find(item => item.id === input.questionId);
        if (!question) throw new Error('Unexpected moderation question identifier');
        if (input.file) {
          const fileFields = ['name', 'url', 'type', 'size', 'extension', 'bucket', 'path'];
          if (Object.keys(input.file).some(key => !fileFields.includes(key))) throw new Error('Unexpected review file input fields');
          if (!['file', 'video'].includes(question.type) || !String(input.file.url).startsWith('https://upload.e2e.invalid/cdn/')) throw new Error('Unexpected moderation file input');
        }
        const hasAnswer = input.answer != null && input.answer !== '' && (!Array.isArray(input.answer) || input.answer.length > 0);
        if ((hasAnswer || input.file) && !(question.audience as string[]).includes(audience)) throw new Error('Answer outside actor audience');
        if (input.comment && (audience !== 'reviewer' || !question.hasComment)) throw new Error('Comment outside configured permissions');
      }
      if (fields.includes('updateUserProfile')) {
        if (vars.avatar?.url !== uploadMetadata.directUrl || !state.uploads.some(upload => upload.source === 'user-profile' && upload.offset === upload.length)) throw new Error('Unexpected profile metadata');
        state.profileAvatar = structuredClone(vars.avatar); roots.updateUserProfile = { success: true, message: 'Updated' };
      }
      if (fields.includes('saveReviewAnswer')) {
        if (state.options.role !== 'mentor' || vars.reviewId !== 1001 || vars.submissionId !== 901 || !fixtureQuestions.some(question => question.id === vars.questionId)) throw new Error('Unexpected review draft identifiers');
        if (moderation) {
          if (moderation.stage !== 'assigned') throw new Error('Review draft outside assigned state');
          validateModeratedAnswer(vars, 'reviewer');
        }
        if (moderation?.failReviewSave) roots.saveReviewAnswer = { success: false, message: 'Temporary review save failure' };
        else {
          state.reviewAnswers[vars.questionId] = { answer: vars.answer, comment: vars.comment, file: vars.file };
          roots.saveReviewAnswer = { success: true, message: 'Saved' };
        }
      }
      if (fields.includes('submitReview')) {
        if (!moderation || state.options.role !== 'mentor' || moderation.stage !== 'assigned'
          || vars.assessmentId !== 501 || vars.reviewId !== 1001 || vars.submissionId !== 901 || !Array.isArray(vars.answers)) throw new Error('Unexpected review submission actor/state/identifiers');
        vars.answers.forEach((answer: Record<string, any>) => validateModeratedAnswer(answer, 'reviewer'));
        moderation.reviewSubmissions.push(structuredClone(vars));
        if (moderation.failReviewSubmit) {
          moderation.failReviewSubmit = false; roots.submitReview = { success: false, message: 'Temporary review submission failure' };
        } else {
          for (const { questionId, ...answer } of vars.answers) state.reviewAnswers[questionId] = structuredClone(answer);
          moderation.stage = 'published'; state.reviewDone = true;
          roots.submitReview = { success: true, message: 'Review submitted' };
        }
      }
      if (fields.includes('updateTodoItem')) {
        if (!moderation || state.options.role !== 'participant' || moderation.stage !== 'published'
          || vars.id !== null || vars.identifier !== 'AssessmentSubmission-901' || vars.isDone !== true) throw new Error('Unexpected feedback acknowledgment actor/state/identifier');
        moderation.acknowledgments.push(structuredClone(vars));
        if (moderation.failAcknowledgment) {
          moderation.failAcknowledgment = false; roots.updateTodoItem = { success: false };
        } else { moderation.stage = 'read'; roots.updateTodoItem = { success: true }; }
      }
      if (fields.includes('submitPulseCheck')) {
        if (vars.contextId !== 601 || vars.teamId !== 2001 || vars.targetUserId != null || JSON.stringify(vars.answers) !== JSON.stringify(feedbackQuestions.map(question => ({ questionId: question.id, choiceId: 1 })))) throw new Error('Unexpected pulse-check target/answers');
        state.pulseSubmissions.push(structuredClone(vars)); state.pulseSubmitted = true; roots.submitPulseCheck = true;
      }
      if (fields.includes('auth') && vars.experienceUuid && !['e2e-exp-1', 'e2e-exp-2'].includes(vars.experienceUuid)) throw new Error('Unexpected program identifier');
      if (fields.includes('projects') && JSON.stringify(vars.ids) !== '[101,202]') throw new Error('Unexpected project identifiers');
      if (fields.includes('saveSubmissionAnswer')) {
        if (vars.submissionId !== 901 || !fixtureQuestions.some(q => q.id === vars.questionId)) throw new Error('Unexpected draft identifiers');
        if (moderation) {
          if (state.options.role !== 'participant' || moderation.stage !== 'draft') throw new Error('Learner draft outside permitted actor/state');
          validateModeratedAnswer(vars, 'submitter');
        }
        if (state.failSave) { roots.saveSubmissionAnswer = { success: false, message: 'Temporary save failure' }; }
        else { if (vars.file) state.files[vars.questionId] = structuredClone(vars.file); else state.answers[vars.questionId] = vars.answer; roots.saveSubmissionAnswer = { success: true, message: 'Saved' }; }
      }
      if (fields.includes('submitAssessment')) {
        if (vars.submissionId !== 901 || vars.assessmentId !== 501 || vars.contextId !== 601) throw new Error('Unexpected submission identifiers');
        if (moderation) {
          if (state.options.role !== 'participant' || moderation.stage !== 'draft') throw new Error('Learner submission outside permitted actor/state');
          vars.answers.forEach((answer: Record<string, any>) => validateModeratedAnswer(answer, 'submitter'));
        }
        state.submitCount++;
        state.submissions.push(structuredClone(vars));
        if (state.failSubmit) { state.failSubmit = false; roots.submitAssessment = { success: false, message: 'Temporary submission failure' }; }
        else {
          for (const answer of vars.answers) state.answers[answer.questionId] = answer.answer;
          state.submitted = true; roots.submitAssessment = { success: true, message: 'Submitted' };
          if (moderation) moderation.stage = 'submitted';
        }
      }
      if (fields.includes('activity') && vars.id !== 301) throw new Error('Unexpected activity identifier');
      if (fields.includes('topic') && Number(vars.id) !== 401) throw new Error('Unexpected topic identifier');
      if (fields.includes('assessment') && (vars.assessmentId !== 501 || vars.contextId !== 601 || (![301, 0, null].includes(vars.activityId)) || vars.reviewer !== (state.options.role === 'mentor' && ['roles', 'role-pages', 'moderation'].includes(state.options.scenario)) || ![null, undefined, 901].includes(vars.submissionId))) throw new Error(`Unexpected assessment identifiers: ${JSON.stringify(vars)}`);
      for (const field of fields) if (!(field in roots)) throw new Error(`Unhandled GraphQL field: ${field}`);
      await route.fulfill({ json: { data: projectSelection(roots, operation.selectionSet) } });
    } catch (error) {
      state.failures.push(String(error));
      await route.fulfill({ status: 500, json: { errors: [{ message: String(error) }] } });
    }
  });
}
export const test = base.extend<{ api: MockState }>({
  api: async ({ page }, use) => {
    const state = newState();
    page.on('pageerror', error => {
      // Known Stencil dev-runtime aria watcher race; retained as explicit evidence.
      if (["Cannot read properties of undefined (reading 'onAriaChanged')", "undefined is not an object (evaluating 'instance[watchMethodName]')"].includes(error.message)
        && error.stack?.includes('setAttribute')) {
        state.warnings.push(error.stack || error.message);
      } else state.failures.push(`Browser error: ${error.message}`);
    });
    page.on('console', message => {
      if (message.type() === 'error' && /^ERROR (TypeError|ReferenceError):/.test(message.text())) {
        state.failures.push(message.text());
      }
    });
    await installMockAPI(page, state);
    await use(state);
    if (state.warnings.length) await test.info().attach('stencil-runtime-warning', { body: state.warnings.join('\n\n'), contentType: 'text/plain' });
    if (test.info().status !== test.info().expectedStatus) {
      await test.info().attach('mock-state', { body: JSON.stringify(state, null, 2), contentType: 'application/json' });
    }
    expect(state.failures, 'Unhandled mock traffic').toEqual([]);
  },
});
export { expect };
export async function login(page: Page, authToken = token) {
  await page.goto(`/?token=${authToken}`);
  await expect(page.getByRole('button', { name: names.first, exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/experiences$/);
}
export async function openProgram(page: Page, authToken = token) {
  await login(page, authToken);
  await page.getByRole('button', { name: names.first, exact: true }).click();
  await expect(page.getByRole('heading', { name: names.first, exact: true })).toBeVisible();
}
