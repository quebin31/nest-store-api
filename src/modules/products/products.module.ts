import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductImagesService } from './product-images.service';
import { ProductsRepository } from './products.repository';
import { SharedUsersModule } from '../../shared/users/users.module';
import { ProductImagesRepository } from './product-images.repository';

@Module({
  controllers: [ProductsController],
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
