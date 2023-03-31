import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductImagesService } from './product-images.service';

@Module({
  providers: [ProductsService, ProductImagesService],
  controllers: [ProductsController],
})
export class ProductsModule {
}
