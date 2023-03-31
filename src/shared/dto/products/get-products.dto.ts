import { IsDate, IsIn, IsOptional, Matches, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetProductsDto {

  @IsOptional()
  @IsIn(['desc', 'asc'])
  sort: 'desc' | 'asc' = 'desc';

  @IsOptional()
  @IsDate()
  cursor?: Date;

  @IsOptional()
  @Transform(({value}) => parseInt(value))
  @Min(10)
  @Max(50)
  take = 25;

  @IsOptional()
  @Matches(/^[a-z][a-z_]+$/)
  category?: string;

  @IsOptional()
  @IsIn(['all', 'active', 'inactive'])
  include: 'all' | 'active' | 'inactive' = 'active';
}
