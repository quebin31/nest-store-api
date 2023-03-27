import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { MulterFile } from '../../utils/multer';
import { Product, ProductImage, ProductState } from '@prisma/client';
import omit from 'lodash.omit';
import { UpdateProductDto } from './dto/update-product.dto';

type FullProduct = Product & { images: ProductImage[] }

@Injectable()
export class ProductsService {
  constructor(private productsRepository: ProductsRepository) {
  }

  private createProductResponse(product: FullProduct) {
    return {
      ...omit(product, ['images', 'state']),
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

  async updateProduct(id: string, ownerId: string, data: UpdateProductDto) {
    const product = await this.productsRepository.findWithOwner(id, ownerId);
    if (!product || product.state === ProductState.deleted) {
      throw new NotFoundException(`No product found with id ${id}`);
    }

    const minQuantity = data.minQuantity ?? product.minQuantity;
    const maxQuantity = data.maxQuantity ?? product.maxQuantity;
    if (minQuantity > maxQuantity) {
      throw new BadRequestException('Incoherent minQuantity and/or maxQuantity');
    }

    const availableStock = product.availableStock + (data.availableStockDelta ?? 0);
    if (availableStock < 0) {
      throw new BadRequestException('Resultant available stock would be negative!');
    }

    const cleansedData = { ...omit(data, ['availableStockDelta']), availableStock };
    const updated = await this.productsRepository.updateProduct(product.id, cleansedData)
      .catch(_ => {
        throw new NotFoundException('No product was found or category is invalid');
      });

    return this.createProductResponse(updated);
  }

  async deleteProduct(id: string, ownerId: string) {
    const product = await this.productsRepository.deleteProduct(id, ownerId);
    if (!product) {
      throw new NotFoundException(`No product found with id ${id}`);
    }
  }
}
