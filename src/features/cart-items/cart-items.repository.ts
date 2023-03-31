import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ProductState } from '@prisma/client';

export type GetCartItems = {
  sort: 'desc' | 'asc',
  user: string,
}

@Injectable()
export class CartItemsRepository {
  constructor(private prismaService: PrismaService) {
  }

  async addCartItem(userId: string, addCartItemDto: AddCartItemDto) {
    return this.prismaService.cartItem.create({
      data: {
        quantity: addCartItemDto.quantity,
        user: { connect: { id: userId } },
        product: { connect: { id: addCartItemDto.productId } },
      },
      include: {
        product: { include: { images: true } },
      },
    });
  }

  async findCartItems(options: GetCartItems) {
    return this.prismaService.cartItem.findMany({
      where: {
        userId: options.user,
        product: {
          state: { not: ProductState.deleted },
        },
      },
      orderBy: { createdAt: options.sort },
      include: {
        product: { include: { images: true } },
      },
    });
  }

  async updateCartItem(userId: string, productId: string, updateCartItemDto: UpdateCartItemDto) {
    return this.prismaService.cartItem.update({
      where: {
        userId_productId: { userId, productId },
      },
      data: {
        quantity: updateCartItemDto.quantity,
      },
      include: {
        product: { include: { images: true } },
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
