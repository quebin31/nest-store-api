import { Module } from '@nestjs/common';
import { CartItemsController } from './cart-items.controller';
import { CartItemsRepository } from './cart-items.repository';
import { CartItemsService } from './cart-items.service';

@Module({
  controllers: [CartItemsController],
  providers: [CartItemsRepository, CartItemsService],
})
export class CartItemsModule {
}
