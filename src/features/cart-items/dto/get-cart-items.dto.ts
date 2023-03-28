import { IsIn, IsOptional } from 'class-validator';

export class GetCartItemsDto {

  @IsOptional()
  @IsIn(['desc', 'asc'])
  sort: 'desc' | 'asc' = 'desc';
}
