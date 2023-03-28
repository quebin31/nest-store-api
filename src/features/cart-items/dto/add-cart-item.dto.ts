import { IsDefined, IsInt, IsPositive, IsUUID } from 'class-validator';

export class AddCartItemDto {

  @IsDefined()
  @IsUUID()
  productId!: string;

  @IsDefined()
  @IsInt()
  @IsPositive()
  quantity!: number;
}
