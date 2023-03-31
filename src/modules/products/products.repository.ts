import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductState } from '@prisma/client';
import { UpdateProductDto } from './dto/update-product.dto';
import { omit } from 'lodash';
import { GetProductsDto } from './dto/get-products.dto';
import { FullProduct } from '../../types/products';

export type GetProductsOptions = Omit<GetProductsDto, 'include'> & {
  skip: number,
  states: Exclude<ProductState, 'deleted'>[],
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

  async findById(id: string): Promise<FullProduct | null> {
    return this.prismaService.product.findFirst({
      where: { id, state: { not: ProductState.deleted } },
      include: { images: { orderBy: { createdAt: 'desc' } } },
    });
  }

  async findWithOwner(id: string, ownerId: string): Promise<FullProduct | null> {
    return this.prismaService.product.findFirst({
      where: {
        id,
        createdById: ownerId,
        state: { not: ProductState.deleted },
      },
      include: { images: { orderBy: { createdAt: 'desc' } } },
    });
  }

  async findProducts(options: GetProductsOptions): Promise<FullProduct[]> {
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
      include: { images: { orderBy: { createdAt: 'desc' } } },
    });
  }

  async updateProduct(id: string, data: UpdateProductDto): Promise<FullProduct> {
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
            increment: data.availableStockDelta ?? 0,
          },
        },
        include: { images: { orderBy: { createdAt: 'desc' } } },
      });

      if (product.minQuantity > product.maxQuantity) {
        throw new BadRequestException('Incoherent minQuantity and/or maxQuantity');
      }

      if (product.availableStock < 0) {
        throw new BadRequestException('Resultant available stock would be negative!');
      }

      return product;
    });
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
