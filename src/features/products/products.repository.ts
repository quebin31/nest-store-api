import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { omit } from '../../utils/types';
import { ProductImage, ProductState } from '@prisma/client';

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
    return this.prismaService.product.findUnique({
      where: { id },
      include: { images: true, category: true },
    });
  }
}
