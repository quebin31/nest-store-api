import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { RepositoriesModule } from '../../shared/repositories.module';

@Module({
  imports: [RepositoriesModule],
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {
}
