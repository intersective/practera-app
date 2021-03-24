# Chat Service

Chat service is the service calling all the chat graphQL server call need for **chat-list.component.ts** and **chat-room.component.ts**.

<!-- markdown-toc start - Don't edit this section. Run M-x markdown-toc-refresh-toc -->
- [Public methods](#-Public-methods)
- [Exported interfaces](#Exported-interfaces)
<!-- tocstop -->

---

### Public methods
Public methods are the method that can access from another service or component by importing chat service.

#### **getChatList()** 
Call graphQL chat server to get all the chat channel that login user can access.

- **Return data**
  -  ChatChannel[]
  Observable function with chatChannel Array.
  - **Sample return object**
    ```json
    [
      {
        uuid: "3715d6928",
        name: "Team 1",
        avatar: "https://example.com/team-white.png",
        pusherChannel: "sdbudw-wdu3r8",
        isxAnnouncement: false,
        isDirectMessage: false,
        readonly: false,
        roles: [
          "participant",
          "coordinator",
          "admin"
        ],
        unreadMessageCount: 0,
        lastMessage: null,
        lastMessageCreated: null
      }
    ] 
    ```

#### **getMessageList(pram)**
Call graphQL chat server to get message history of specific chat channel.

- **Parameters (pram)**
  - MessageListParams Object
  - **Sample parameters**
    ```json
    {
      channelUuid: "3715d6928",
      cursor: "1sde3w90fnv",
      size: 15,
    }
    ```

- **Return data**
  - MessageListResult
  Observable function with MessageListResult object.
  - **Sample return objec**t
    ```json
    {
      cursor: "ajnafb83434",
      messages: 
        [
          {
            uuid: "1",
            senderUuid: "as108",
            message: "test message 01",
            file: null,
            created: "2020-02-27 01:48:28",
            isSender: true
          },
          {
            uuid: "3",
            senderUuid: "dfbjkf3y",
            message: "test message 02",
            file: null,
            created: "2019-11-27 02:21:21",
            isSender: false
          }
        ]
    }
    ```

#### **getChatMembers(channelId)**
Call graphQL chat server to get member list of specific chat channel.

- **Parameters**
  - chat channel id.
- **Return data**
  - Observable<[ChannelMembers](#ChannelMembers)[]>
    Observable function with MessageListResult object.
  - **Sample return object**
    ```json
    [
      {
        uuid: "8bee29d0",
        name: "student",
        role: "participant",
        avatar: "https://example.com/image.png"
      },
      {
        uuid: "8d1f3cdf",
        name: "student+01",
        role: "participant",
        avatar: "https://example.com/image.jpg"
      }
    ]
    ```
#### **getPusherChannels**
Call graphQL chat server to get all pusher channels of the chat channel. Pusher channels use to make chat real time.

- **Return data**
  - Pusher channel Array
  - **Sample return object**
    ```json
    [
      {
        pusherChannel: "mbdfu-nbd98"
      },
      {
        pusherChannel: "12hjdc-pasa6"
      }
    ]
    ```

### Exported interfaces
Exported interfaces are using inside chat service and also they can use in any other service or component by importing them.

####ChatChannel
   This interface use for chat channel. It contains all the attributes of one chat channel object.
   
   **attributes**

| Name               | Type     |
| ------------------ | -------- |
| uuid               | string   |
| name               | string   |
| avatar             | string   |
| isAnnouncement     | boolean  |
| isDirectMessage    | boolean  |
| pusherChannel      | string   |
| readonly           | boolean  |
| roles              | string[] |
| unreadMessageCount | number   |
| lastMessage        | string   |
| lastMessageCreated | string   |

####ChannelMembers
   This interface use for channel members. It contains attributes of one chat member object.

**attributes**

| Name   | Type   |
| ------ | ------ |
| uuid   | string |
| name   | string |
| avatar | string |
| roles  | string |

####Message
  This interface use for identify one message object.

**attributes**

| Name         | Type    |
| ------------ | ------- | --------- |
| uuid         | string  | mandatory |
| senderUuid   | string  | optional  |
| senderName   | string  | optional  |
| senderRole   | string  | optional  |
| senderAvatar | string  | optional  |
| isSender     | boolean | mandatory |
| message      | string  | mandatory |
| created      | string  | mandatory |
| file         | object  | mandatory |
| preview      | string  | optional  |
| noAvatar     | string  | optional  |
| channelUuid  | string  | optional  |

####MessageListResult
  This interface use to pass message list and the cursor. Cursor is use to do the pagination of chat channel message history.

**attributes**

| Name     | Type      |
| -------- | --------- |
| cursor   | string    |
| messages | [message](#Message)[] |