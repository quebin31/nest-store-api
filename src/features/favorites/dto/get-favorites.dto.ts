import { IsIn, IsOptional } from 'class-validator';

export class GetFavoritesDto {

  @IsOptional()
  @IsIn(['desc', 'asc'])
  sort: 'desc' | 'asc' = 'desc';
}
