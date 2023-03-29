import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { GetOrders, OrdersRepository } from './orders.repository';
import { Order, OrderItem, Product, ProductState, Role } from '@prisma/client';
import pick from 'lodash.pick';
import omit from 'lodash.omit';
import { GetOrdersDto } from './dto/get-orders.dto';
import { UsersRepository } from '../users/users.repository';

export type FullOrder = Order & { items: (OrderItem & { product: Product })[] }

@Injectable()
export class OrdersService {
  constructor(
    private ordersRepository: OrdersRepository,
    private usersRepository: UsersRepository,
  ) {
  }

  static createProductItem(product: Product) {
    return {
      ...omit(product, ['state']),
      active: product.state === ProductState.active,
    };
  }

  static createOrderResponse(order: FullOrder) {
    return {
      ...pick(order, ['id', 'createdAt', 'updatedAt', 'state', 'receivedAt', 'userId']),
      orderItems: order.items.map(item => ({
        ...pick(item, ['quantity', 'lockedPrice']),
        product: OrdersService.createProductItem(item.product),
      })),
    };
  }

  async createOrder(userId: string) {
    const activeCartItems = await this.ordersRepository.getActiveCartItems(userId);
    const invalidItems = activeCartItems.filter(item => {
      const product = item.product;
      return item.quantity < product.minQuantity
        || item.quantity > product.maxQuantity
        || item.quantity > product.availableStock;
    });

    if (invalidItems.length !== 0) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Bad Request',
        error: 'Invalid quantities or products out of stock',
        invalidProductIds: invalidItems.map(it => it.productId),
      });
    }

    const order = await this.ordersRepository.createOrder(userId, activeCartItems);
    return OrdersService.createOrderResponse(order);
  }

  async getOrders(userId: string, getOrdersDto: GetOrdersDto) {
    let user: string | undefined;
    if (getOrdersDto.user === 'self') {
      user = userId;
    } else {
      const caller = await this.usersRepository.findById(userId);
      if (!caller || caller.role !== Role.manager) {
        throw new ForbiddenException(`Invalid manager user`);
      }

      user = getOrdersDto.user;
    }

    const options: GetOrders = {
      user,
      sort: getOrdersDto.sort,
      skip: getOrdersDto.cursor !== undefined ? 1 : 0,
      take: getOrdersDto.take,
      cursor: getOrdersDto.cursor,
      states: getOrdersDto.state,
    };

    const orders = await this.ordersRepository.findOrders(options);
    const last = orders.at(orders.length - 1);
    const mapped = orders.map(OrdersService.createOrderResponse);

    return { orders: mapped, length: mapped.length, cursor: last?.createdAt ?? null };
  }
}
