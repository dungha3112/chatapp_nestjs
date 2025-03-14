import { Request } from 'express';
import { Conversation, Group, GroupMessage, Message, User } from './typeorm';

//CreateUserDetails
export type CreateUserDetails = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

//ValidateUserDetails
export type ValidateUserDetails = {
  email: string;
  password: string;
};

//FindUserParams
export type FindUserParams = Partial<{
  id: number;
  email: string;
  username: string;
}>;

//FindUserOptions
export type FindUserOptions = Partial<{
  selectAll?: boolean;
}>;

// Conversation
//CreateConversationsParams
export type CreateConversationsParams = {
  email: string;
  message: string;
};

//AuthenticatedRequest
export interface AuthenticatedRequest extends Request {
  user: User;
}

// Message
//CreateMessageParams
export type CreateMessageParams = {
  conversationId: number;
  content?: string;
  user: User;
};

//CreateMessageResponse
export type CreateMessageResponse = {
  message: Message;
  conversation: Conversation;
};

// DeleteMessageParams
export type DeleteMessageParams = {
  userId: number;
  conversationId: number;
  messageId: number;
};

// DeleteMessageResponse
export type DeleteMessageResponse = {
  message: Message;
  userId: number;
};

//UpdateConversationParams
export type UpdateConversationParams = Partial<{
  id: number;
  lastMessageSent: Message;
}>;

//GetConversationMessagesParams
export type GetConversationMessagesParams = {
  id: number;
  limit: number;
};

//AccessConversationParams
export type AccessConversationParams = {
  conversationId: number;
  userId: number;
};

// EditMessageParams
export type EditMessageParams = {
  conversationId: number;
  userId: number;
  messageId: number;
  content: string;
};

/**
 *
 *
 * // TYPE GROUP
 */
// Group
// CreateGroupParams
export type CreateGroupParams = {
  users: string[];
  title: string;
  owner: User;

  message: string;
};

//AccessGroupParams
export type AccessGroupParams = {
  groupId: number;
  userId: number;
};

//CreateGroupMessageParams
export type CreateGroupMessageParams = {
  groupId: number;
  content: string;
  user: User;
};

// CreateGroupMessageResponse
export type CreateGroupMessageResponse = {
  message: GroupMessage;
  group: Group;
};

// DeleteGroupMessageParams
export type DeleteGroupMessageParams = {
  userId: number;
  groupId: number;
  messageId: number;
};

// DeleteGroupMessageResponse
export type DeleteGroupMessageResponse = {
  message: GroupMessage;
  userId: number;
};

//UpdateGroupParams
export type UpdateGroupParams = Partial<{
  id: number;
  lastMessageSent: GroupMessage;
}>;

//GetGroupMessagesParams
export type GetGroupMessagesParams = {
  id: number;
  limit: number;
};

// EditGroupMessageParams
export type EditGroupMessageParams = {
  groupId: number;
  userId: number;
  messageId: number;
  content: string;
};

// AddGroupRecipientParams
export type AddGroupRecipientParams = {
  ownerId: number;
  groupId: number;
  email: string;
};

// AddGroupUserResponse
export type AddGroupUserResponse = {
  group: Group;
  user: User;
};

// RemoveGroupRecipientParams
export type RemoveGroupRecipientParams = {
  ownerId: number;
  groupId: number;
  removeUserId: number;
};

// RemoveGroupRecipientResponse
export type RemoveGroupRecipientResponse = {
  group: Group;
  user: User;
};

// TranferOwnerParams
export type TranferOwnerParams = {
  userId: number;
  groupId: number;
  newOwnerId: number;
};

//UserLeaveGroupParams
export type UserLeaveGroupParams = {
  userId: number;
  groupId: number;
};

//CheckUserInGroupParams
export type CheckUserInGroupParams = {
  userId: number;
  groupId: number;
};

/**
 *
 * FRIEND
 */
export type CreateFriendParams = {
  sender: User;
  email: string;
};

export type DeleteFriendRequestParams = {
  id: number;
  userId: number;
};

/**
 * FRIEND REQUESTS
 */

export type FriendRequestStatus = 'accepted' | 'pending' | 'rejected';

export type FriendRequestParams = {
  id: number;
  userId: number;
};

export type CancelFriendRequestParams = {
  id: number;
  userId: number;
};

export type RejectFriendRequestParams = {
  id: number;
  userId: number;
};
