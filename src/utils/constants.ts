import { MulterField } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export enum Routes {
  AUTH = 'auth',
  USERS = 'users',
  USERS_PROFILES = 'users/profiles',

  CONVERSATIONS = 'conversations',
  MESSAGES = 'conversations/:id/messages',
  GROUPS = 'groups',
  GROUPS_MESSAGES = 'groups/:id/messages',
  GROUPS_RECIPIENTS = 'groups/:id/recipients',
  FRIENDS = 'friends',
  FRIENDS_REQUESTS = 'friends/requests',
  EXISTS = 'exists',
}

export enum Services {
  AUTH = 'AUTH_SERVICE',
  USERS = 'USERS_SERVICE',
  USERS_PROFILES = 'USERS_PROFILES_SERVICE',

  CONVERSATIONS = 'CONVERSATIONS_SERVICE',
  MESSAGES = 'MESSAGES_SERVICE',

  MESSAGE_ATTACHMENTS = 'MESSAGE_ATTACHMENTS_SERVICE',

  GATEWAY_SESSION_MANAGER = 'GATEWAY_SESSION_MANAGER',
  GROUPS = 'GROUPS_SERVICE',
  GROUPS_MESSAGES = 'GROUPS_MESSAGES_SERVICE',
  GROUPS_RECIPIENTS = 'GROUPS_RECIPIENTS_SERVICE',
  FRIENDS = 'FRIENDS_SERVICE',
  FRIENDS_REQUESTS = 'FRIENDS_REQUESTS_SERVICE',

  CLOUDINARY_CLIENT = 'CLOUDINARY_CLIENT',
  IMAGE_UPLOAD_SERVICE = 'IMAGE_UPLOAD_SERVICE',

  SESSION = 'SESSION_SERVICE',
}

export enum ServerEvents {
  FRIEND_REQUEST_CREATE = 'friend.request.create',
  FRIEND_REQUEST_ACCEPT = 'friend.request.accept',
  FRIEND_REQUEST_CANCEL = 'friend.request.cancel',
  FRIEND_REQUEST_REJECT = 'friend.request.reject',

  FRIEND_REMOVED = 'friend.removed',
}

export const UserProfileFileFields: MulterField[] = [
  {
    name: 'banner',
    maxCount: 1,
  },
  {
    name: 'avatar',
    maxCount: 1,
  },
];

export const MessageAttachmentFileFields: MulterField[] = [
  { name: 'attachments', maxCount: 5 },
];
