import { IsNotEmpty } from 'class-validator';

export class EditMessageDto {
  @IsNotEmpty()
  content: string;
}
