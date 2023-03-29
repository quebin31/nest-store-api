import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CartItem, OrderState, Product, ProductState } from '@prisma/client';

export type CartItemProduct = CartItem & { product: Product }

export type GetOrders = {
  sort: 'desc' | 'asc',
  skip: number,
  take: number,
  user?: string,
  cursor?: Date,
  states: OrderState[],
}

@Injectable()
export class OrdersRepository {
  constructor(private prismaService: PrismaService) {
  }

  async getActiveCartItems(userId: string) {
    return this.prismaService.cartItem.findMany({
      where: {
        userId,
        product: { state: ProductState.active },
      },
      include: { product: true },
    });
  }

  async createOrder(userId: string, cartItems: CartItemProduct[]) {
    const itemsData = cartItems.map(item => ({
      quantity: item.quantity,
      lockedPrice: item.product.price,
      product: { connect: { id: item.productId } },
    }));

    return this.prismaService.$transaction(async tx => {
      await tx.cartItem.deleteMany({ where: { userId } });

      for (const item of cartItems) {
        const newAvailableStock = item.product.availableStock - item.quantity;
        if (newAvailableStock < 0) {
          throw new BadRequestException(`Product ${item.productId} out of stock`);
        }

        await tx.product.update({
          where: { id: item.productId },
          data: {
            availableStock: newAvailableStock,
          },
        });
      }

      return tx.order.create({
        data: {
          state: OrderState.pending,
          items: { create: itemsData },
          user: { connect: { id: userId } },
        },
        include: {
          items: { include: { product: true } },
        },
      });
    });
  }

  async findOrders(options: GetOrders) {
    const cursor = options.cursor === undefined
      ? undefined
      : { createdAt: options.cursor };

    return this.prismaService.order.findMany({
      where: {
        userId: options.user,
        state: { in: options.states },
      },
      orderBy: {
        createdAt: options.sort,
      },
      skip: options.skip,
      take: options.take,
      cursor,
      include: {
        items: { include: { product: true } },
      },
    });
  }
}