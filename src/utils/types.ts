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
