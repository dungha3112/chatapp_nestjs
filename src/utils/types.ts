export type LoginUserDetails = {
  email: string;
  password: string;
};

export type CreateUserDetails = LoginUserDetails & {
  firstName: string;
  lastName: string;
};
