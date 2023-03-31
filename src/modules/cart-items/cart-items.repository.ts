import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ProductState } from '@prisma/client';
import { GetCartItemsDto } from './dto/get-cart-items.dto';
import { FullCartItem } from '../../types/cart-items';

export type GetCartItemsOptions = GetCartItemsDto & { user: string }

@Injectable()
export class CartItemsRepository {
  constructor(private prismaService: PrismaService) {
  }

  async findProductById(id: string) {
    return this.prismaService.product.findFirst({
      where: { id, state: { not: ProductState.deleted } },
    });
  }

  async addCartItem(userId: string, addCartItemDto: AddCartItemDto): Promise<FullCartItem> {
    return this.prismaService.cartItem.create({
      data: {
        quantity: addCartItemDto.quantity,
        user: { connect: { id: userId } },
        product: { connect: { id: addCartItemDto.productId } },
      },
      include: {
        product: {
          include: { images: { orderBy: { createdAt: 'desc' } } },
        },
      },
    });
  }

  async findCartItems(options: GetCartItemsOptions): Promise<FullCartItem[]> {
    return this.prismaService.cartItem.findMany({
      where: {
        userId: options.user,
        product: {
          state: { not: ProductState.deleted },
        },
      },
      orderBy: { createdAt: options.sort },
      include: {
        product: {
          include: { images: { orderBy: { createdAt: 'desc' } } },
        },
      },
    });
  }

  async updateCartItem(userId: string, productId: string, data: UpdateCartItemDto): Promise<FullCartItem> {
    return this.prismaService.cartItem.update({
      where: {
        userId_productId: { userId, productId },
      },
      data: {
        quantity: data.quantity,
      },
      include: {
        product: {
          include: { images: { orderBy: { createdAt: 'desc' } } },
        },
      },
    });
  }

  async deleteCartItem(userId: string, productId: string) {
    return this.prismaService.cartItem.delete({
      where: {
        userId_productId: { userId, productId },
      },
    });
  }
}
