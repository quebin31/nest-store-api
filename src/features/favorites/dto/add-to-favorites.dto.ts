import { IsDefined, IsUUID } from 'class-validator';

export class AddToFavoritesDto {

  @IsDefined()
  @IsUUID()
  productId!: string
}
