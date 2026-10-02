import { group, question, members, memberKeys, uploadMetadata } from './advanced-fixtures';
import type { MockState } from './mock-api';

export type ModerationStage = 'draft' | 'submitted' | 'assigned' | 'published' | 'read';
export interface ModerationState {
  stage: ModerationStage;
  reviewSubmissions: Array<Record<string, unknown>>;
  acknowledgments: Array<Record<string, unknown>>;
  failReviewSave: boolean;
  failReviewSubmit: boolean;
  failAcknowledgment: boolean;
  failTodoRefresh: boolean;
}
export const actors = {
  participant: { id: 701, name: 'E2E Learner', email: 'learner@example.invalid', token: 'e2e-synthetic-learner-token' },
  mentor: { id: 704, name: 'E2E Reviewer', email: 'reviewer@example.invalid', token: 'e2e-synthetic-reviewer-token' },
};
export const learnerWork = { 101: 'Learner work ready for expert review', 102: 'Learner private working notes', 301: [3011] };
export const reviewFile = { name: 'evidence.png', type: 'image/png', size: 68, extension: 'png',
  bucket: 'e2e-bucket', path: 'e2e/evidence.png', url: uploadMetadata.cdnUrl };
export const publishedReview = {
  101: { answer: null, comment: 'Specific feedback on the learner reflection' },
  201: { answer: 'Careful expert recommendation', comment: '' },
  202: { answer: 2021, comment: '' },
  203: { answer: [2032], comment: '' },
  204: { answer: 0, comment: '' },
  205: { answer: memberKeys[0], comment: '' },
  206: { answer: [memberKeys[1]], comment: '' },
  207: { answer: null, file: reviewFile, comment: '' },
  208: { answer: null, file: reviewFile, comment: '' },
  209: { answer: null, file: { ...reviewFile, name: 'evidence.mp4', type: 'video/mp4', size: 24, extension: 'mp4',
    path: 'e2e/evidence.mp4', url: 'https://upload.e2e.invalid/cdn/evidence.mp4' }, comment: '' },
  210: { answer: 'Supporting expert rationale', comment: '' },
  211: { answer: 'Final expert recommendation', comment: '' },
  301: { answer: [3012], comment: 'Shared capability feedback' },
};
export function moderationGroups() {
  const expert = { audience: ['reviewer'] };
  return [
    group('Learner responses', [
      question(101, 'Learner reflection', 'text', { isRequired: true, hasComment: true }),
      question(102, 'Learner notes', 'text', { isRequired: true }),
      ...Array.from({ length: 8 }, (_, index) => question(103 + index, `Optional learner note ${index + 1}`)),
    ]),
    group('Shared responses', [question(301, 'Shared capabilities', 'multiple', {
      isRequired: true, hasComment: true, audience: ['submitter', 'reviewer'], choices: [
        { id: 3011, name: 'Analysis', description: '', explanation: '' },
        { id: 3012, name: 'Collaboration', description: '', explanation: '' },
      ],
    })]),
    group('Expert criteria', [
      question(201, 'Reviewer recommendation', 'text', { ...expert, isRequired: true }),
      question(202, 'Reviewer outcome', 'oneof', { ...expert, isRequired: true, choices: [
        { id: 2021, name: 'Ready', description: '', explanation: '' },
        { id: 2022, name: 'Needs support', description: '', explanation: '' },
      ] }),
      question(203, 'Reviewer capabilities', 'multiple', { ...expert, isRequired: true, choices: [
        { id: 2031, name: 'Accurate', description: '', explanation: '' },
        { id: 2032, name: 'Actionable', description: '', explanation: '' },
      ] }),
      question(204, 'Reviewer confidence', 'slider', { ...expert, isRequired: true, min: 0, max: 5 }),
      question(205, 'Review contact', 'team member selector', { ...expert, isRequired: true, teamMembers: members }),
      question(206, 'Review collaborators', 'multi team member selector', { ...expert, isRequired: true, teamMembers: members }),
      question(207, 'Review document', 'file', { ...expert, isRequired: true, fileType: 'any' }),
      question(208, 'Review image', 'file', { ...expert, fileType: 'image' }),
      question(209, 'Review video', 'video', { ...expert, fileType: 'video' }),
      question(210, 'Supporting rationale', 'text', expert),
      question(211, 'Final recommendation', 'text', { ...expert, isRequired: true }),
    ]),
  ];
}
export function seedModeration(api: MockState, stage: ModerationStage, role: 'participant' | 'mentor' = 'participant') {
  Object.assign(api.options, { scenario: 'moderation', role, team: true });
  api.moderation = { stage, reviewSubmissions: [], acknowledgments: [],
    failReviewSave: false, failReviewSubmit: false, failAcknowledgment: false, failTodoRefresh: false };
  if (stage !== 'draft') api.answers = structuredClone(learnerWork);
  if (stage === 'published' || stage === 'read') api.reviewAnswers = structuredClone(publishedReview);
}
export function moderationTodoItems(stage: ModerationStage, role: 'participant' | 'mentor') {
  const review = role === 'mentor' && stage === 'assigned';
  const feedback = role === 'participant' && stage === 'published';
  if (!review && !feedback) return [];
  return [{ id: review ? 1101 : 1102, name: review ? 'Review assignment' : 'Published feedback',
    identifier: review ? 'AssessmentReview-1001' : 'AssessmentSubmission-901', isDone: false,
    model: review ? 'AssessmentReview' : 'AssessmentSubmission', foreignKey: review ? 1001 : 901,
    created: '2026-10-02T00:00:00Z', meta: JSON.stringify({ assessment_name: 'E2E Reflection',
      submitter_name: 'E2E Learner', reviewer_name: 'E2E Reviewer', activity_id: 301,
      context_id: 601, assessment_id: 501, assessment_submission_id: 901 }) }];
}
