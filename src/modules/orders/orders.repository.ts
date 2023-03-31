import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { OrderState, ProductState } from '@prisma/client';
import { CancelOrderDto, UpdateProductOrderDto } from './dto/update-order.dto';
import { GetOrdersDto } from './dto/get-orders.dto';
import { FullOrder } from '../../types/orders';

export type GetOrdersOptions = Omit<GetOrdersDto, 'state'> & {
  skip: number,
  states: OrderState[],
}

@Injectable()
export class OrdersRepository {
  constructor(private prismaService: PrismaService) {
  }

  private async getActiveCartItems(userId: string) {
    return this.prismaService.cartItem.findMany({
      where: {
        userId,
        product: { state: ProductState.active },
      },
      include: { product: true },
    });
  }

  async createOrder(userId: string): Promise<FullOrder> {
    const cartItems = await this.getActiveCartItems(userId);
    const createItemsData = cartItems.map(item => ({
      quantity: item.quantity,
      lockedPrice: item.product.price,
      product: {
        connect: { id: item.productId },
      },
    }));

    return this.prismaService.$transaction(async tx => {
      await tx.cartItem.deleteMany({ where: { userId } });

      for (const item of cartItems) {
        const product = await tx.product.update({
          where: { id: item.productId },
          data: {
            availableStock: { decrement: item.quantity },
          },
        });

        if (product.availableStock < 0) {
          throw new BadRequestException(`Product ${item.productId} out of stock`);
        }

        if (item.quantity < product.minQuantity || item.quantity > product.maxQuantity) {
          const message = `Item ${item.productId} quantity not in [${product.minQuantity}..${product.maxQuantity}]`;
          throw new BadRequestException(message);
        }
      }

      return tx.order.create({
        data: {
          state: OrderState.pending,
          items: { create: createItemsData },
          user: { connect: { id: userId } },
        },
        include: {
          items: { include: { product: true } },
        },
      });
    });
  }

  async findOrders(options: GetOrdersOptions) {
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
        cancelReason: { include: { code: true } },
      },
    });
  }

  async findOrder(id: string, userId?: string) {
    return this.prismaService.order.findFirst({
      where: { id, userId },
      include: {
        items: { include: { product: true } },
        cancelReason: { include: { code: true } },
      },
    });
  }

  async updateOrderAsReceived(id: string) {
    return this.prismaService.order.update({
      where: { id },
      data: { state: OrderState.received },
      include: {
        items: { include: { product: true } },
        cancelReason: { include: { code: true } },
      },
    });
  }

  async updateOrderAsConfirmed(id: string, updates: UpdateProductOrderDto[]) {
    const itemsUpdateData = updates.map(update => ({
      where: {
        orderId_productId: { orderId: id, productId: update.productId },
      },
      data: {
        quantity: update.quantity,
        lockedPrice: update.price,
      },
    }));

    return this.prismaService.$transaction(async tx => {
      for (const update of updates) {
        if (update.quantity === undefined) {
          continue;
        }

        const orderItem = await tx.orderItem.findUniqueOrThrow({
          where: {
            orderId_productId: { orderId: id, productId: update.productId },
          },
        });

        const product = await tx.product.update({
          where: { id: update.productId },
          data: {
            availableStock: {
              increment: orderItem.quantity - update.quantity,
            },
          },
        });

        if (product.availableStock < 0) {
          throw new BadRequestException(`Product ${update.productId} out of stock`);
        }

        if (update.quantity < product.minQuantity || update.quantity > product.maxQuantity) {
          const message = `Item ${update.productId} quantity not in [${product.minQuantity}..${product.maxQuantity}]`;
          throw new BadRequestException(message);
        }
      }

      return tx.order.update({
        where: { id },
        data: {
          state: OrderState.confirmed,
          items: { update: itemsUpdateData },
        },
        include: {
          items: { include: { product: true } },
          cancelReason: { include: { code: true } },
        },
      });
    });
  }

  async updateOrderAsCanceled(id: string, userId: string, data: CancelOrderDto) {
    return this.prismaService.$transaction(async tx => {
      const order = await tx.order.update({
        where: { id },
        data: {
          state: OrderState.canceled,
          cancelReason: {
            create: {
              reason: data.cancelReason,
              code: {
                connect: { code: data.cancelCode },
              },
              canceledBy: {
                connect: { id: userId },
              },
            },
          },
        },
        include: {
          items: { include: { product: true } },
          cancelReason: { include: { code: true } },
        },
      });

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            availableStock: {
              increment: item.quantity,
            },
          },
        });
      }

      return order;
    });
  }
}
