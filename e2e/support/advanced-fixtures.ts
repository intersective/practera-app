export interface AdvancedOptions {
  scenario: 'standard' | 'types' | 'roles' | 'role-pages' | 'team360' | 'moderation';
  role: 'participant' | 'mentor';
  team: boolean;
  locked: boolean;
  status?: 'in progress' | 'pending review' | 'published' | 'done';
  feedback: 'none' | 'available' | 'missing-meta';
  locks: 'none' | 'linked' | 'unsupported' | 'mixed' | 'missing';
}
export const defaultOptions: AdvancedOptions = {
  scenario: 'standard', role: 'participant', team: false, locked: false,
  feedback: 'none', locks: 'none',
};
export const members = [
  { userId: 702, userName: 'E2E Peer A', teamId: 2001, __typename: 'AssessmentQuestionTeamMember' },
  { userId: 703, userName: 'E2E Peer B', teamId: 2001, __typename: 'AssessmentQuestionTeamMember' },
];
export const memberKeys = members.map(member => JSON.stringify(member));
export function question(id: number, name: string, type = 'text', extra: Record<string, unknown> = {}) {
  return { id, name, type, description: '', isRequired: false, hasComment: false,
    audience: ['submitter'], fileType: null, min: null, max: null, choices: [], teamMembers: [], ...extra };
}
export const group = (name: string, questions: ReturnType<typeof question>[]) => ({ name, description: '', questions });
export function advancedGroups(scenario: AdvancedOptions['scenario']) {
  if (scenario === 'types') return [group('Question controls', [
    question(101, 'Learning notes', 'text', { isRequired: true }),
    question(102, 'Preferred approach', 'oneof', { isRequired: true, choices: [
      { id: 1021, name: 'Investigate', description: '', explanation: 'You chose investigation.' },
      { id: 1022, name: 'Prototype', description: '', explanation: '' },
    ] }),
    question(103, 'Useful capabilities', 'multiple', { isRequired: true, choices: [
      { id: 1031, name: 'Analysis', description: '', explanation: '' },
      { id: 1032, name: 'Collaboration', description: '', explanation: '' },
    ] }),
    question(104, 'Confidence level', 'slider', { isRequired: true, min: 1, max: 5 }),
    question(105, 'Select one colleague', 'team member selector', { isRequired: true, teamMembers: members }),
    question(106, 'Select collaborators', 'multi team member selector', { isRequired: true, teamMembers: members }),
    question(107, 'Evidence document', 'file', { isRequired: true, fileType: 'any' }),
    question(108, 'Image evidence', 'file', { fileType: 'image' }),
    question(109, 'Video evidence', 'video', { fileType: 'video' }),
  ])];
  if (scenario === 'roles') return [
    group('Reviewer criteria A', [
      question(201, 'Reviewer recommendation', 'text', { isRequired: true, audience: ['reviewer'] }),
      question(202, 'Reviewer confidence', 'slider', { audience: ['reviewer'], min: 0, max: 5 }),
    ]),
    group('Learner responses', [question(101, 'Learner reflection', 'text', { isRequired: true, hasComment: true })]),
    group('Shared responses', [
      question(103, 'Shared capabilities', 'multiple', { audience: ['submitter', 'reviewer'], hasComment: true, choices: [
        { id: 1031, name: 'Analysis', description: '', explanation: '' },
        { id: 1032, name: 'Collaboration', description: '', explanation: '' },
      ] }),
    ]),
    group('Reviewer criteria B', [question(203, 'Reviewer outcome', 'oneof', { audience: ['reviewer'], choices: [
      { id: 2031, name: 'Ready', description: '', explanation: '' },
      { id: 2032, name: 'Needs support', description: '', explanation: '' },
    ] })]),
  ];
  if (scenario === 'role-pages') return [
    group('Long reviewer criteria', Array.from({ length: 12 }, (_, i) =>
      question(201 + i, `Reviewer criterion ${i + 1}`, 'text', { audience: ['reviewer'] }))),
    group('Long learner responses', Array.from({ length: 11 }, (_, i) =>
      question(101 + i, `Learner response ${i + 1}`))),
  ];
  if (scenario === 'team360') return [
    group('General reflection', [question(110, 'General learning', 'text', { isRequired: true })]),
    group('Peer review 1', [
      question(120, 'First colleague', 'team member selector', { teamMembers: members }),
      question(121, 'First colleague feedback', 'text'),
    ]),
    group('Peer review 2', [question(130, 'Second colleague', 'multi team member selector', { teamMembers: members })]),
    group('Peer review overflow', [question(140, 'Overflow colleague', 'team member selector', { teamMembers: members })]),
    group('Self reflection', [question(150, 'My next step', 'text', { isRequired: true })]),
  ];
  return null;
}
export const feedbackQuestions = [7, 8, 9, 20].map(id => ({
  id, name: `Pulse question ${id}`, description: 'Synthetic feedback question.', choices: [
    { id: 1, name: 'On track', description: 'The project is progressing as expected.' },
    { id: 2, name: 'Need support', description: 'The project needs help.' },
  ],
}));
export const uploadMetadata = {
  bucket: 'e2e-bucket', path: 'e2e/evidence.png',
  cdnUrl: 'https://upload.e2e.invalid/cdn/evidence.png',
  directUrl: 'https://upload.e2e.invalid/direct/evidence.png',
};
