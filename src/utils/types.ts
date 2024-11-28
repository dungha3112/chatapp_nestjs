import { Request } from 'express';
import { Conversation, Message, User } from './typeorm';

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

//CreateConversationsParams
export type CreateConversationsParams = {
  email: string;
  message: string;
};

//AuthenticatedRequest
export interface AuthenticatedRequest extends Request {
  user: User;
}

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
  userId: number;
  messageId: number;
  conversationId: number;
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

// EditMessageParams
export type EditMessageParams = {
  conversationId: number;
  userId: number;
  messageId: number;
  content: string;
};

// DeleteMessageResponse
export type EditMessageResponse = {
  conversationId: number;
  userId: number;
  messageId: number;
  content: string;
};

// Group
// CreateGroupParams
export type CreateGroupParams = {
  users: string[];
  title: string;
  owner: User;
};
