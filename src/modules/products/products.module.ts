import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { RepositoriesModule } from '../../shared/repositories/repositories.module';
import { ProductImagesService } from './product-images.service';

@Module({
  imports: [RepositoriesModule],
  providers: [ProductsService, ProductImagesService],
  controllers: [ProductsController],
})
export class ProductsModule {
}
