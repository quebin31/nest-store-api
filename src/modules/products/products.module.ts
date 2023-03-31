import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductImagesService } from './images/product-images.service';
import { ProductsRepository } from './products.repository';
import { SharedUsersModule } from '../../shared/users/users.module';
import { ProductImagesRepository } from './images/product-images.repository';
import { ProductImagesController } from './images/product-images.controller';

@Module({
  controllers: [ProductsController, ProductImagesController],
  imports: [SharedUsersModule],
  providers: [
    ProductsRepository,
    ProductsService,
    ProductImagesRepository,
    ProductImagesService,
  ],
})
export class ProductsModule {
}
