import { Module } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { UsersRepository } from './users.repository';

@Module({
  providers: [UsersRepository, ProductsRepository],
  exports: [UsersRepository, ProductsRepository],
})
export class RepositoriesModule {
}
