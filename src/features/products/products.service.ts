import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { GetProducts, ProductsRepository } from './products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { MulterFile } from '../../utils/multer';
import { Product, ProductImage, ProductState } from '@prisma/client';
import omit from 'lodash.omit';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsDto } from './dto/get-products.dto';

export type FullProduct = Product & { images: ProductImage[] }

@Injectable()
export class ProductsService {
  constructor(private productsRepository: ProductsRepository) {
  }

  static createProductResponse(product: FullProduct) {
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

    return ProductsService.createProductResponse(fullProduct);
  }

  async getProduct(id: string) {
    const product = await this.productsRepository.findById(id);
    if (!product || product.state === ProductState.deleted) {
      throw new NotFoundException(`No product found with id ${id}`);
    }

    return ProductsService.createProductResponse(product);
  }

  async getProducts(getProductsDto: GetProductsDto) {
    let states: Exclude<ProductState, 'deleted'>[];
    if (getProductsDto.include === 'all') {
      states = ['active', 'inactive'];
    } else {
      states = [getProductsDto.include];
    }

    const options: GetProducts = {
      states,
      sort: getProductsDto.sort,
      skip: getProductsDto.cursor !== undefined ? 1 : 0,
      take: getProductsDto.take,
      category: getProductsDto.category,
      cursor: getProductsDto.cursor,
    };

    const products = await this.productsRepository.findProducts(options);
    const last = products.at(products.length - 1);
    const mapped = products.map(ProductsService.createProductResponse);

    return { products: mapped, length: mapped.length, cursor: last?.createdAt ?? null };
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

    return ProductsService.createProductResponse(updated);
  }

  async deleteProduct(id: string, ownerId: string) {
    const product = await this.productsRepository.deleteProduct(id, ownerId);
    if (!product) {
      throw new NotFoundException(`No product found with id ${id}`);
    }
  }
}
