import { IsDefined, IsInt, IsNumber, IsOptional, Length, Matches, Min } from 'class-validator';

export class UpdateProductDto {

  @IsOptional()
  @Length(10, 64)
  name?: string;

  @IsOptional()
  @Length(10, 256)
  description?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  price?: number;

  @IsOptional()
  @Matches(/^[a-z][a-z_]+$/)
  categoryName?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  minQuantity?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxQuantity?: number;

  @IsOptional()
  active?: boolean;

  @IsDefined()
  @IsInt()
  availableStockDelta?: number;
}
