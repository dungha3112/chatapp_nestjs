import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MaxLength(32)
  firstName: string;

  @IsNotEmpty()
  @MaxLength(32)
  lastName: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
