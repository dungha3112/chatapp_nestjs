import { ArrayNotEmpty, IsString } from 'class-validator';
import { User } from 'src/utils/typeorm';

export class CreateGroupDto {
  @IsString({ each: true })
  @ArrayNotEmpty()
  users: string[];

  title: string;
}
