import { Injectable } from '@nestjs/common';
import { UploadedImage } from './product-images.service';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { FullProduct } from '../../../types/products';

@Injectable()
export class ProductImagesRepository {
  constructor(private prismaService: PrismaService) {
  }

  async createProductImages(id: string, images: UploadedImage[]): Promise<FullProduct> {
    return this.prismaService.product.update({
      where: { id },
      data: {
        thumbnailUrl: images.at(0)?.imageUrl,
        images: {
          createMany: {
            data: images.map(image => ({ id: image.imageId, imageUrl: image.imageUrl })),
          },
        },
      },
      include: { images: { orderBy: { createdAt: 'desc' } } },
    });
  }

  async createProductImage(id: string, image: UploadedImage, hasThumbnail: boolean) {
    return this.prismaService.product.update({
      where: { id },
      data: {
        thumbnailUrl: hasThumbnail ? undefined : image.imageUrl,
        images: {
          create: { id: image.imageId, imageUrl: image.imageUrl },
        },
      },
      include: { images: { orderBy: { createdAt: 'desc' } } },
    });
  }

  async findProductImage(id: string, userId: string) {
    return this.prismaService.productImage.findFirst({
      where: { id, product: { createdById: userId } },
    });
  }

  async updateProductImage(id: string, image: UploadedImage, replaceThumbnail: boolean) {
    return this.prismaService.product.update({
      where: { id },
      data: {
        thumbnailUrl: replaceThumbnail ? image.imageUrl : undefined,
        images: {
          update: {
            where: { id: image.imageId },
            data: { imageUrl: image.imageUrl },
          },
        },
      },
      include: { images: { orderBy: { createdAt: 'desc' } } },
    });
  }

  async deleteProductImage(id: string, newThumbnailUrl?: string) {
    return this.prismaService.product.update({
      where: { id },
      data: {
        thumbnailUrl: newThumbnailUrl,
        images: {
          delete: { id },
        },
      },
      include: { images: { orderBy: { createdAt: 'desc' } } },
    });
  }
}
