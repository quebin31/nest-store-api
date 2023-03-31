import { Product, ProductImage } from '@prisma/client';

export type FullProduct = Product & {
  images: ProductImage[]
}
