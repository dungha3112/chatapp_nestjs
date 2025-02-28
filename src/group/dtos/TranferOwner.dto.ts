import { IsNotEmpty, IsNumber } from 'class-validator';

export class TranferOwnerDto {
  @IsNotEmpty()
  @IsNumber()
  newOwnerId: number;
}
