import { Controller, Delete, HttpCode, Patch, Post, Req } from '@nestjs/common';
import { ProductImagesService } from './product-images.service';
import { IdParam } from '../../../decorators/params';
import { ProductImages } from './product-images.decorator';
import { Roles } from '../../../decorators/roles';
import { Role } from '@prisma/client';
import { AuthRequest } from '../../auth/jwt.strategy';
import { ImageFiles } from '../../../decorators/image-files';
import { MulterFile } from '../../../utils/multer';

@Controller({ path: '/products', version: '1' })
@Roles(Role.manager)
export class ProductImagesController {
  constructor(private productImagesService: ProductImagesService) {
  }

  @Post('/:id/images')
  @HttpCode(201)
  @ProductImages(1)
  async uploadImage(
    @IdParam() productId: string,
    @Req() req: AuthRequest,
    @ImageFiles() image: MulterFile,
  ) {
    return this.productImagesService.createProductImage(productId, req.user.id, image);
  }

  @Patch('/images/:id')
  @HttpCode(200)
  @ProductImages(1)
  async updateImage(
    @IdParam() imageId: string,
    @Req() req: AuthRequest,
    @ImageFiles() image: MulterFile,
  ) {
    return this.productImagesService.updateProductImage(imageId, req.user.id, image);
  }

  @Delete('/images/:id')
  @HttpCode(200)
  async deleteImage(@IdParam() imageId: string, @Req() req: AuthRequest) {
    return this.productImagesService.deleteProductImage(imageId, req.user.id);
  }
}

