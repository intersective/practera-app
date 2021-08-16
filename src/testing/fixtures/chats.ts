import { ChannelMembers, ChatChannel } from "@app/chat/chat.service";

const mockMembers: ChannelMembers[] = [
  {
    uuid: '1',
    name: 'student+01',
    role: 'participant',
    email: 'student+01@test.com',
    avatar: 'https://www.gravatar.com/avatar/21b7427270a606e8a3c4413a13bb47c6?d=https://sandbox.practera.com/img/user-512.png&s=50'
  },
  {
    uuid: '2',
    name: 'student1',
    role: 'participant',
    email: 'student1@test.com',
    avatar: 'https://www.gravatar.com/avatar/21b7427270a606e8a3c4413a13bb47c6?d=https://sandbox.practera.com/img/user-512.png&s=50'
  },
  {
    uuid: '3',
    name: 'student2',
    role: 'participant',
    email: 'student2@test.com',
    avatar: 'https://www.gravatar.com/avatar/21b7427270a606e8a3c4413a13bb47c6?d=https://sandbox.practera.com/img/user-512.png&s=50'
  }
];

const channel1: ChatChannel = {
  uuid: '35326928',
  name: 'Team 1',
  avatar: 'https://sandbox.practera.com/img/team-white.png',
  pusherChannel: 'sdb746-93r7dc-5f44eb4f',
  isAnnouncement: false,
  isDirectMessage: false,
  readonly: false,
  roles: [
    'participant',
    'coordinator',
    'admin'
  ],
  unreadMessageCount: 0,
  lastMessage: null,
  lastMessageCreated: null,
  canEdit: true,
};

const channel2: ChatChannel = {
  uuid: 'ced963c1',
  name: 'Team 1 + Mentor',
  avatar: 'https://sandbox.practera.com/img/team-white.png',
  pusherChannel: 'kb5gt-9nfbj-5f45eb4g',
  isAnnouncement: false,
  isDirectMessage: false,
  readonly: false,
  roles: [
    'participant',
    'mentor',
    'coordinator',
    'admin'
  ],
  unreadMessageCount: 0,
  lastMessage: null,
  lastMessageCreated: null,
  canEdit: true,
};

const mockChats = {
  data: {
    channels: [channel1, channel2]
  }
};

export { mockChats, mockMembers };
