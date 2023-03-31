import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductImagesService } from './product-images.service';
import { ProductsRepository } from './products.repository';
import { SharedUsersModule } from '../../shared/users/users.module';

@Module({
  controllers: [ProductsController],
  imports: [SharedUsersModule],
  providers: [ProductsRepository, ProductImagesService, ProductsService],
})
export class ProductsModule {
}
