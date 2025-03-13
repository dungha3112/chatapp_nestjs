import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateFriendDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
