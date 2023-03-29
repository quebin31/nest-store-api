import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductImage, ProductState } from '@prisma/client';
import { UpdateProductDto } from './dto/update-product.dto';
import omit from 'lodash.omit';

export type UpdateProduct = Omit<UpdateProductDto, 'availableStockDelta'> & {
  availableStock: number
}

export type GetProducts = {
  sort: 'desc' | 'asc',
  skip: number,
  take: number,
  category?: string,
  cursor?: Date,
  states: Exclude<ProductState, 'deleted'>[]
}

@Injectable()
export class ProductsRepository {
  constructor(private prismaService: PrismaService) {
  }

  async getProductCategories() {
    return this.prismaService.category.findMany();
  }

  async createProduct(userId: string, data: CreateProductDto) {
    return this.prismaService.product.create({
      data: {
        ...omit(data, ['active', 'categoryName']),
        state: data.active ? ProductState.active : ProductState.inactive,
        createdBy: { connect: { id: userId } },
        category: { connect: { name: data.categoryName } },
      },
    });
  }

  async createProductImages(id: string, images: { id: string, url: string }[]) {
    return this.prismaService.$transaction(async tx => {
      const productImages: ProductImage[] = [];
      for (const image of images) {
        const productImage = await tx.productImage.create({
          data: { id: image.id, imageUrl: image.url, product: { connect: { id } } },
        });

        productImages.push(productImage);
      }

      return productImages;
    });
  }

  async findById(id: string) {
    const product = await this.prismaService.product.findUnique({
      where: { id },
      include: { images: true },
    });

    return !product || product.state === ProductState.deleted ? null : product;
  }

  async findWithOwner(id: string, ownerId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: ownerId },
      include: { products: { where: { id }, include: { images: true } } },
    });

    return !user ? null : user.products.at(0) ?? null;
  }

  async findProducts(options: GetProducts) {
    const cursor = options.cursor === undefined
      ? undefined
      : { createdAt: options.cursor };

    return this.prismaService.product.findMany({
      where: {
        categoryName: options.category,
        state: { not: ProductState.deleted, in: options.states },
      },
      orderBy: {
        createdAt: options.sort,
      },
      skip: options.skip,
      take: options.take,
      cursor,
      include: { images: true },
    });
  }

  async updateProduct(id: string, data: UpdateProductDto) {
    const category = data.categoryName === undefined
      ? undefined
      : { connect: { name: data.categoryName } };

    return this.prismaService.$transaction(async tx => {
      const product = await tx.product.update({
        where: { id },
        data: {
          ...omit(data, ['active', 'categoryName', 'availableStockDelta']),
          category,
          state: data.active ? ProductState.active : ProductState.inactive,
          availableStock: {
            increment: data.availableStockDelta,
          }
        },
        include: { images: true },
      });

      if (product.minQuantity > product.maxQuantity) {
        throw new BadRequestException('Incoherent minQuantity and/or maxQuantity');
      }

      if (product.availableStock < 0) {
        throw new BadRequestException('Resultant available stock would be negative!');
      }

      return product;
    })
  }

  async deleteProduct(id: string, ownerId: string) {
    const { products } = await this.prismaService.user.update({
      where: { id: ownerId },
      data: {
        products: {
          update: {
            where: { id },
            data: { state: ProductState.deleted },
          },
        },
      },
      include: { products: true },
    });

    return products.at(0) ?? null;
  }
}
