export enum Routes {
  AUTH = 'auth',
  USERS = 'users',
  CONVERSATIONS = 'conversations',
  MESSAGES = 'conversations/:conversationId/messages',
  GROUPS = 'groups',
  GROUPS_MESSAGES = 'groups/:groupId/messages',
  GROUPS_RECIPIENTS = 'groups/:groupId/recipients',
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
}
