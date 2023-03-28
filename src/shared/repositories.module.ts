import { Module } from '@nestjs/common';
import { UsersRepository } from '../features/users/users.repository';
import { ProductsRepository } from '../features/products/products.repository';

@Module({
  providers: [UsersRepository, ProductsRepository],
  exports: [UsersRepository, ProductsRepository],
})
export class RepositoriesModule {
}
