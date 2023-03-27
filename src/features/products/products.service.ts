import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { MulterFile } from '../../utils/multer';
import { Category, Product, ProductImage, ProductState } from '@prisma/client';
import omit from 'lodash.omit';

type FullProduct = Product & { images: ProductImage[], category: Category }

@Injectable()
export class ProductsService {
  constructor(private productsRepository: ProductsRepository) {
  }

  private createProductResponse(product: FullProduct) {
    return {
      ...omit(product, ['images', 'categoryName', 'state']),
      active: product.state === ProductState.active,
      images: product.images.map(image => ({ imageId: image.id, imageUrl: image.imageUrl })),
    };
  }

  async getAvailableCategories() {
    const categories = await this.productsRepository.getProductCategories();
    return { categories };
  }

  async createProduct(userId: string, data: CreateProductDto, images: Array<MulterFile>) {
    if (data.minQuantity > data.maxQuantity) {
      throw new BadRequestException('Incoherent minQuantity and maxQuantity');
    }

    const product = await this.productsRepository.createProduct(userId, data)
      .catch(_ => {
        throw new BadRequestException('Invalid manager or category');
      });

    // TODO: Upload image to S3 and create product images

    const fullProduct = await this.productsRepository.findById(product.id);
    if (!fullProduct) {
      throw new NotFoundException('Product not found');
    }

    return this.createProductResponse(fullProduct);
  }
}
