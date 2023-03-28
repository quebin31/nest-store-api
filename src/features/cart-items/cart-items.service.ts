import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CartItemsRepository } from './cart-items.repository';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { CartItem, Product } from '@prisma/client';
import { FullProduct, ProductsService } from '../products/products.service';
import pick from 'lodash.pick';
import { GetCartItemsDto } from './dto/get-cart-items.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

export type FullCartItem = CartItem & { product: FullProduct }

@Injectable()
export class CartItemsService {
  constructor(private cartItemsRepository: CartItemsRepository) {
  }

  static createCartItemResponse(cartItem: FullCartItem) {
    return {
      ...pick(cartItem, ['createdAt', 'updatedAt', 'quantity']),
      product: ProductsService.createProductResponse(cartItem.product),
    };
  }

  private isValidQuantity(quantity: number, product: Product) {
    return quantity >= product.minQuantity && quantity <= product.maxQuantity;
  }

  async addCartItem(userId: string, addCartItemDto: AddCartItemDto) {
    const product = await this.cartItemsRepository.getValidProduct(addCartItemDto.productId);
    if (!product) {
      throw new NotFoundException('Invalid product');
    }

    if (!this.isValidQuantity(addCartItemDto.quantity, product)) {
      throw new BadRequestException(`Invalid quantity, not in [${product.minQuantity}..${product.maxQuantity}]`);
    }

    const cartItem = await this.cartItemsRepository.addCartItem(userId, addCartItemDto)
      .catch(_ => {
        throw new NotFoundException('Invalid user or product');
      });

    return CartItemsService.createCartItemResponse(cartItem);
  }

  async getCartItems(userId: string, getCartItemsDto: GetCartItemsDto) {
    const options = {
      sort: getCartItemsDto.sort,
      user: userId,
    };

    const cartItems = await this.cartItemsRepository.getCartItems(options);
    return cartItems.map(CartItemsService.createCartItemResponse);
  }

  async updateCartItem(userId: string, productId: string, updateCartItemDto: UpdateCartItemDto) {
    const product = await this.cartItemsRepository.getValidProduct(productId);
    if (!product) {
      try {
        await this.deleteCartItem(userId, productId);
      } catch (_) {
        // no-op
      }

      throw new NotFoundException('Invalid product');
    }

    if (!this.isValidQuantity(updateCartItemDto.quantity, product)) {
      throw new BadRequestException(`Invalid quantity, not in [${product.minQuantity}..${product.maxQuantity}]`);
    }

    const cartItem = await this.cartItemsRepository
      .updateCartItem(userId, productId, updateCartItemDto)
      .catch(_ => {
        throw new NotFoundException(`No matching cart item found for user`);
      });

    return CartItemsService.createCartItemResponse(cartItem);
  }

  async deleteCartItem(userId: string, productId: string) {
    return this.cartItemsRepository.deleteCartItem(userId, productId)
      .catch(_ => {
        throw new NotFoundException(`No matching cart item found`);
      });
  }
}