import { IsDefined, IsInt, IsPositive } from 'class-validator';

export class UpdateCartItemDto {

  @IsDefined()
  @IsInt()
  @IsPositive()
  quantity!: number;
}
