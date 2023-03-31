import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { GetProducts, ProductsRepository } from './products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { MulterFile } from '../../utils/multer';
import { Product, ProductImage, ProductState } from '@prisma/client';
import omit from 'lodash.omit';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsDto } from './dto/get-products.dto';
import { ProductImagesService } from './product-images.service';

export type FullProduct = Product & { images: ProductImage[] }

@Injectable()
export class ProductsService {
  constructor(
    private productImagesService: ProductImagesService,
    private productsRepository: ProductsRepository,
  ) {
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

    const partialProduct = await this.productsRepository.createProduct(userId, data)
      .catch(_ => {
        throw new BadRequestException('Invalid manager or category');
      });

    const productImages = await this.productImagesService.uploadProductImages(images);
    const product = await this.productsRepository.createProductImages(partialProduct.id, productImages);
    return ProductsService.createProductResponse(product);
  }

  async getProduct(id: string) {
    const product = await this.productsRepository.findById(id);
    if (!product) {
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
    if (!product) {
      throw new NotFoundException(`No product found with id ${id}`);
    }

    const updated = await this.productsRepository.updateProduct(product.id, data)
      .catch(e => {
        if (e instanceof HttpException) {
          throw e;
        } else {
          throw new NotFoundException('No product was found or category is invalid');
        }
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
