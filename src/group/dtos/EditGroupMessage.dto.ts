import { IsNotEmpty } from 'class-validator';

export class EditGroupMessageDto {
  @IsNotEmpty()
  content: string;
}
