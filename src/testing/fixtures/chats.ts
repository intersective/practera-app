import { ChannelMembers } from "@app/chat/chat.service";

export const mockMembers: ChannelMembers[] = [
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
