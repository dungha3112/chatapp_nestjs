export enum Routes {
  AUTH = 'auth',
  USERS = 'users',
  CONVERSATIONS = 'conversations',
  MESSAGES = 'conversations/:conversationId/messages',
  GROUPS = 'groups',
  GROUPS_MESSAGES = 'groups/:groupId/messages',
  GROUPS_RECIPIENTS = 'groups/:groupId/recipients',
  FRIENDS = 'friends',
  FRIENDS_REQUESTS = 'friends/requests',
}

export enum Services {
  AUTH = 'AUTH_SERVICE',
  USERS = 'USERS_SERVICE',
  CONVERSATIONS = 'CONVERSATIONS_SERVICE',
  MESSAGES = 'MESSAGES_SERVICE',
  GATEWAY_SESSION_MANAGER = 'GATEWAY_SESSION_MANAGER',
  GROUPS = 'GROUPS_SERVICE',
  GROUPS_MESSAGES = 'GROUPS_MESSAGES_SERVICE',
  GROUPS_RECIPIENTS = 'GROUPS_RECIPIENTS_SERVICE',
  FRIENDS = 'FRIENDS_SERVICE',
  FRIENDS_REQUESTS = 'FRIENDS_REQUESTS_SERVICE',
}

export enum ServerEvents {
  FRIEND_REQUEST_CREATE = 'friend.request.create',
  FRIEND_REQUEST_ACCEPT = 'friend.request.accept',
  FRIEND_REQUEST_CANCEL = 'friend.request.cancel',
  FRIEND_REQUEST_REJECT = 'friend.request.reject',

  FRIEND_REMOVED = 'friend.removed',
}
