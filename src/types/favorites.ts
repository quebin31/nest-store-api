import { ProductUserFavorite } from '@prisma/client';
import { FullProduct } from './products';

export type FullFavorite = ProductUserFavorite & {
  product: FullProduct
}
