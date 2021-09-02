const SAMPLE_AVATAR = 'https://cdn.filestackcontent.com/uYQuauwNRdD43PfCQ4iW';

const chats = [
  {
    uuid: '1',
    name: 'Team 1',
    avatar: SAMPLE_AVATAR,
    pusherChannel: 'pusher-channel-name',
    roles: ['participant'],
    isAnnouncement: false,
    isDirectMessage: false,
    readonly: false,
    unreadMessageCount: 2,
    lastMessageCreated: '2020-01-25 06:18:45',
    lastMessage: 'test 1',
    canEdit: false
  },
  {
    uuid: '2',
    name: 'Team 2',
    avatar: SAMPLE_AVATAR,
    pusherChannel: 'pusher-channel-name',
    roles: ['participant'],
    isAnnouncement: false,
    isDirectMessage: false,
    readonly: false,
    unreadMessageCount: 2,
    lastMessageCreated: '2020-01-30 04:18:45',
    lastMessage: 'test 2',
    canEdit: false
  },
  {
    uuid: '3',
    name: 'Team 3',
    avatar: SAMPLE_AVATAR,
    pusherChannel: 'pusher-channel-name',
    roles: ['participant'],
    isAnnouncement: false,
    isDirectMessage: false,
    readonly: false,
    unreadMessageCount: 2,
    lastMessageCreated: null,
    lastMessage: null,
    canEdit: false
  },
  {
    uuid: '4',
    name: 'Team 4',
    avatar: SAMPLE_AVATAR,
    pusherChannel: 'pusher-channel-name',
    roles: ['participant'],
    isAnnouncement: false,
    isDirectMessage: false,
    readonly: false,
    unreadMessageCount: 2,
    lastMessageCreated: '2020-05-30 04:18:45',
    lastMessage: 'test 4',
    canEdit: false
  },
];

export const ChatsFixture = chats;
