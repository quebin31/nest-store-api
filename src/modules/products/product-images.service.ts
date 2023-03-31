import { Injectable } from '@nestjs/common';
import { S3Service } from '../../shared/s3/s3.service';
import { MulterFile } from '../../utils/multer';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

export type UploadedImage = { imageId: string, imageUrl: string }

@Injectable()
export class ProductImagesService {
  constructor(private s3Service: S3Service) {
  }

  private static bucketName = 'kdc-store-bucket';

  private async getImageUrl(id: string) {
    const region = await this.s3Service.config.region();
    const bucket = ProductImagesService.bucketName;
    return `https://${bucket}.s3.${region}.amazonaws.com/${id}`;
  }

  async uploadProductImage(id: string, image: MulterFile) {
    const putObjCommand = new PutObjectCommand({
      Bucket: ProductImagesService.bucketName,
      Key: id,
      Body: image.buffer,
      ContentType: image.mimetype,
    });

    await this.s3Service.send(putObjCommand);
    return this.getImageUrl(id);
  }

  async uploadProductImages(images: MulterFile[]): Promise<UploadedImage[]> {
    const uploadPromises = images.map(async image => {
      const imageId = randomUUID();
      const imageUrl = await this.uploadProductImage(imageId, image);
      return { imageId, imageUrl };
    });

    return (await Promise.allSettled(uploadPromises))
      .map(it => it.status === 'fulfilled' ? it.value : null)
      .filter(it => it !== null) as Array<UploadedImage>;
  }
}
