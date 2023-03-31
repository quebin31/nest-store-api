import { Injectable } from '@nestjs/common';
import { S3Service } from '../../shared/s3/s3.service';
import { MulterFile } from '../../utils/multer';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { ProductImagesRepository } from './product-images.repository';
import { FullProduct } from '../../types/products';

export type UploadedImage = { imageId: string, imageUrl: string }

@Injectable()
export class ProductImagesService {
  constructor(
    private productImagesRepository: ProductImagesRepository,
    private s3Service: S3Service,
  ) {
  }

  private static bucketName = 'kdc-store-bucket';

  private async getImageUrl(id: string) {
    const region = await this.s3Service.config.region();
    const bucket = ProductImagesService.bucketName;
    return `https://${bucket}.s3.${region}.amazonaws.com/${id}`;
  }

  private async uploadProductImage(id: string, image: MulterFile) {
    const putObjCommand = new PutObjectCommand({
      Bucket: ProductImagesService.bucketName,
      Key: id,
      Body: image.buffer,
      ContentType: image.mimetype,
    });

    await this.s3Service.send(putObjCommand);
    return this.getImageUrl(id);
  }

  private uploadProductImages = (images: Map<string, MulterFile>) =>
    [...images.entries()].map(async ([imageId, image]) => ({
      imageId,
      imageUrl: await this.uploadProductImage(imageId, image),
    }));

  async createProductImages(productId: string, images: MulterFile[]): Promise<FullProduct> {
    const uploadPromises = this.uploadProductImages(new Map(images.map(it => [randomUUID(), it])));
    const uploadImages = (await Promise.allSettled(uploadPromises))
      .map(it => it.status === 'fulfilled' ? it.value : null)
      .filter(it => it !== null) as Array<UploadedImage>;

    return this.productImagesRepository.createProductImages(productId, uploadImages);
  }
}
