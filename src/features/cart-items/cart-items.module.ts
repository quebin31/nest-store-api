import { Module } from '@nestjs/common';
import { CartItemsController } from './cart-items.controller';
import { CartItemsRepository } from './cart-items.repository';
import { CartItemsService } from './cart-items.service';
import { RepositoriesModule } from '../../shared/repositories/repositories.module';

@Module({
  imports: [RepositoriesModule],
  providers: [CartItemsRepository, CartItemsService],
  controllers: [CartItemsController],
})
export class CartItemsModule {
}
