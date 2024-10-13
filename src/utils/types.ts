import { Request } from 'express';
import { User } from './typeorm';

export type CreateUserDetails = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type ValidateUserDetails = {
  email: string;
  password: string;
};

export type FindUserParams = Partial<{
  id: number;
  email: string;
  username: string;
}>;

export type CreateConversationsParams = {
  email: string;
  message: string;
};

export interface AuthenticatedRequest extends Request {
  user: User;
}

export type CreateMessageParams = {
  conversationId: number;
  content?: string;
  user: User;
};
