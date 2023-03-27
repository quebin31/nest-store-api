import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductsRepository } from './products.repository';
import { UsersRepository } from '../users/users.repository';

@Module({
  providers: [UsersRepository, ProductsRepository, ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {
}
