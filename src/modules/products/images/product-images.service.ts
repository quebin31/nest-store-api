import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { S3Service } from '../../../shared/s3/s3.service';
import { MulterFile } from '../../../utils/multer';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { ProductImagesRepository } from './product-images.repository';
import { ProductsRepository } from '../products.repository';
import { ProductsService } from '../products.service';

export type UploadedImage = { imageId: string, imageUrl: string }

@Injectable()
export class ProductImagesService {
  constructor(
    private productsRepository: ProductsRepository,
    private productImagesRepository: ProductImagesRepository,
    private s3Service: S3Service,
  ) {
  }

  private static maxImages = 5;
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

  async createProductImages(productId: string, images: MulterFile[]) {
    const uploadPromises = this.uploadProductImages(new Map(images.map(it => [randomUUID(), it])));
    const uploadedImages = (await Promise.allSettled(uploadPromises))
      .map(it => it.status === 'fulfilled' ? it.value : null)
      .filter(it => it !== null) as Array<UploadedImage>;

    const product = await this.productImagesRepository.createProductImages(productId, uploadedImages);
    return ProductsService.createProductResponse(product);
  }

  async createProductImage(productId: string, userId: string, image: MulterFile) {
    let product = await this.productsRepository.findWithOwner(productId, userId);
    if (!product) {
      throw new NotFoundException(`Invalid product ${productId}`);
    }

    if (product.images.length === ProductImagesService.maxImages) {
      throw new BadRequestException(`Product ${productId} already has 5 images`);
    }

    const hasThumbnail = product.thumbnailUrl !== null;
    const imageId = randomUUID();
    const imageUrl = await this.uploadProductImage(imageId, image);
    const uploadedImage = { imageId, imageUrl };
    product = await this.productImagesRepository
      .createProductImage(imageId, uploadedImage, hasThumbnail);

    return ProductsService.createProductResponse(product);
  }

  async updateProductImage(id: string, userId: string, image: MulterFile) {
    const productImage = await this.productImagesRepository.findProductImage(id, userId);
    if (!productImage) {
      throw new NotFoundException(`Invalid product image ${id}`);
    }

    let product = await this.productsRepository.findById(productImage.productId);
    if (!product) {
      throw new NotFoundException(`Invalid product`);
    }

    const replaceThumbnail = product.thumbnailUrl?.includes(id) ?? false;
    const imageUrl = await this.uploadProductImage(id, image);
    const uploadedImage = { imageId: id, imageUrl };
    product = await this.productImagesRepository
      .updateProductImage(product.id, uploadedImage, replaceThumbnail);

    return ProductsService.createProductResponse(product);
  }

  async deleteProductImage(id: string, userId: string) {
    const productImage = await this.productImagesRepository.findProductImage(id, userId);
    if (!productImage) {
      throw new NotFoundException(`Invalid product image ${id}`);
    }

    let product = await this.productsRepository.findById(productImage.productId);
    if (!product) {
      throw new NotFoundException(`Invalid product`);
    }

    const isRemovingThumbnail = product.thumbnailUrl?.includes(id) === true;
    const newThumbnailUrl = isRemovingThumbnail ? product.images.at(1)?.imageUrl : undefined;
    product = await this.productImagesRepository.deleteProductImage(id, newThumbnailUrl);

    return ProductsService.createProductResponse(product);
  }
}
