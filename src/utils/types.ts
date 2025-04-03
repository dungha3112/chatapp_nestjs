import { Request } from 'express';
import {
  Conversation,
  Friend,
  FriendRequest,
  Group,
  GroupMessage,
  Message,
  MessageAttachment,
  User,
} from './typeorm';

//CreateUserDetails
export type CreateUserDetails = {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
};

//ValidateUserDetails
export type ValidateUserDetails = {
  username: string;
  password: string;
};

//FindUserParams
export type FindUserParams = Partial<{
  id: number;
  username: string;
}>;

//FindUserOptions
export type FindUserOptions = Partial<{
  selectAll?: boolean;
}>;

// Conversation
//CreateConversationsParams
export type CreateConversationsParams = {
  username: string;
  message: string;
};

//AuthenticatedRequest
export interface AuthenticatedRequest extends Request {
  user: User;
}

/**
 * Message
 */

export interface Attachment extends Express.Multer.File {}

export type UploadMessageAttachmentParams = {
  file: Attachment;
  messageAttachment: MessageAttachment;
};

//CreateMessageParams
export type CreateMessageParams = {
  id: number;
  content?: string;
  attachments?: Attachment[];
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
  id: number;
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
  id: number;
  userId: number;
};

// EditMessageParams
export type EditMessageParams = {
  id: number;
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
  id: number;
  userId: number;
};

// CreateGroupMessageResponse
export type CreateGroupMessageResponse = {
  message: GroupMessage;
  group: Group;
};

// DeleteGroupMessageParams
export type DeleteGroupMessageParams = {
  userId: number;
  id: number;
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
  id: number;
  userId: number;
  messageId: number;
  content: string;
};

// AddGroupRecipientParams
export type AddGroupRecipientParams = {
  ownerId: number;
  id: number;
  username: string;
};

// AddGroupUserResponse
export type AddGroupUserResponse = {
  group: Group;
  user: User;
};

// RemoveGroupRecipientParams
export type RemoveGroupRecipientParams = {
  ownerId: number;
  id: number;
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
  id: number;
  newOwnerId: number;
};

//UserLeaveGroupParams
export type UserLeaveGroupParams = {
  userId: number;
  id: number;
};

//CheckUserInGroupParams
export type CheckUserInGroupParams = {
  userId: number;
  id: number;
};

/**
 *
 * FRIEND
 */
export type CreateFriendParams = {
  sender: User;
  username: string;
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

//FriendRequestAcceptPayload
export type FriendRequestAcceptPayload = {
  friend: Friend;
  friendRequest: FriendRequest;
};

//UpdateUserProfileParams
export type UpdateUserProfileParams = Partial<{
  about: string;
  banner: Express.Multer.File;
  avatar: Express.Multer.File;
}>;

//\\ UploadImageParams

export type UserProfileFiles = Partial<{
  banner: Express.Multer.File[];
  avatar: Express.Multer.File[];
}>;

export type UploadImageResponse = {
  secure_url: string;
  public_id: string;
};
