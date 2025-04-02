import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UserProfileUpdateDto {
  @IsString()
  @MaxLength(200)
  @IsOptional()
  about: string;
}
