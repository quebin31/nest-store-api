import { Injectable } from '@nestjs/common';
import { UploadedImage } from './product-images.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { FullProduct } from '../../types/products';

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
            data: images.map(image => ({
              id: image.imageId,
              imageUrl: image.imageUrl,
            })),
          },
        },
      },
      include: { images: true },
    });
  }
}
