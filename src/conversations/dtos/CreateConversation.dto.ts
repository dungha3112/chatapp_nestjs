import { IsNotEmpty } from 'class-validator';

export class CreateConversationDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  message: string;
}
