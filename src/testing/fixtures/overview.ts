import { Overview, OverviewMilestone, OverviewActivity, OverviewTask } from '../../app/activity/activity.service';

export const Task1 = {
  is_locked: false,
  type: 'assessment',
  id: 1,
  name: 'task 1',
  context_id: 1,
  status: 'done',
  is_team: false,
  progress: 1,
  deadline: null,
  Submitter: {
    id: 1,
    name: 'Submitter 1',
    email: 'submitter1@test.com',
    image: null,
  },
};

export const Activity1 = {
  id: 1,
  name: 'Activity 1',
  is_locked: false,
  Tasks: [
    Task1
  ],
};

export const Milestones1: OverviewMilestone = {
  id: 1,
  name: 'Milestone 1',
  is_locked: false,
  Activities: [
    Activity1
  ],
};

export const RawOverviewRes = [
  {
    id: 1,
    name: 'Project Overview 1',
    Milestones: [
      Milestones1
    ]
  }
];

export const OverviewFixture: Overview = {
  id: 1,
  name: 'Project Overview 1',
  Milestones: [
    Milestones1
  ]
};
