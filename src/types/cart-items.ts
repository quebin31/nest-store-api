import { CartItem } from '@prisma/client';
import { FullProduct } from './products';

export type FullCartItem = CartItem & {
  product: FullProduct
}
