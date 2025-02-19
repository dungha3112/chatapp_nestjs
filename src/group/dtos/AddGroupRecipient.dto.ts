import { IsEmail, IsNotEmpty } from 'class-validator';

export class AddGroupRecipientDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
