import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsDefined,
  IsInt,
  IsNumber,
  IsOptional,
  Length,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateProductDto {

  @IsDefined()
  @Length(10, 64)
  name!: string;

  @IsDefined()
  @Length(10, 256)
  description!: string;

  @IsDefined()
  @IsNumber({ maxDecimalPlaces: 2 })
  price!: number;

  @IsDefined()
  @Matches(/^[a-z][a-z_]+$/)
  categoryName!: string;

  @IsDefined()
  @IsInt()
  @Min(1)
  minQuantity!: number;

  @IsDefined()
  @IsInt()
  @Min(1)
  maxQuantity!: number;

  @IsOptional()
  active = false;

  @IsDefined()
  @IsInt()
  @Min(1)
  availableStock!: number;
}

export class CreateProductFormDto {

  @IsDefined()
  @Transform(({ value }) => plainToInstance(CreateProductDto, JSON.parse(value)))
  @Type(() => CreateProductDto)
  @ValidateNested()
  product!: CreateProductDto;
}
