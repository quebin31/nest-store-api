import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  FullCancelReason,
  FullOrder,
  FullOrderItem,
  GetOrdersOptions,
  OrdersRepository,
} from './orders.repository';
import { OrderState, ProductState, Role } from '@prisma/client';
import pick from 'lodash.pick';
import { GetOrdersDto } from './dto/get-orders.dto';
import { UsersRepository } from '../../shared/users/users.repository';
import omit from 'lodash.omit';
import { CancelOrderDto, ConfirmOrderDto, UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private ordersRepository: OrdersRepository,
    private usersRepository: UsersRepository,
  ) {
  }

  static createOrderItem(item: FullOrderItem) {
    return {
      ...pick(item, ['quantity', 'lockedPrice']),
      product: {
        ...pick(item.product, ['id', 'createdAt', 'name', 'thumbnailUrl', 'createdById']),
        active: item.product.state === ProductState.active,
      },
    };
  }

  static createCancelReasonResponse(cancelReason: FullCancelReason) {
    return {
      ...omit(cancelReason, ['id', 'codeId', 'orderId']),
      code: cancelReason.code.code,
      description: cancelReason.code.description,
    };
  }

  static createOrderResponse(order: FullOrder) {
    return {
      ...pick(order, ['id', 'createdAt', 'updatedAt', 'state', 'receivedAt', 'userId']),
      cancelReason: order.cancelReason
        ? OrdersService.createCancelReasonResponse(order.cancelReason)
        : null,
      orderItems: order.items.map(OrdersService.createOrderItem),
    };
  }

  async createOrder(userId: string) {
    const order = await this.ordersRepository.createOrder(userId)
      .catch(e => {
        if (e instanceof HttpException) {
          throw e;
        } else {
          throw new BadRequestException('Invalid user or products');
        }
      });
    return OrdersService.createOrderResponse(order);
  }

  async getOrders(userId: string, getOrdersDto: GetOrdersDto) {
    let user: string | undefined;
    if (getOrdersDto.user === 'self') {
      user = userId;
    } else {
      const caller = await this.usersRepository.findManager(userId);
      if (!caller) {
        throw new ForbiddenException(`Invalid manager user`);
      }

      user = getOrdersDto.user;
    }

    const options: GetOrdersOptions = {
      ...getOrdersDto,
      user,
      states: getOrdersDto.state,
      skip: getOrdersDto.cursor !== undefined ? 1 : 0,
    };

    const orders = await this.ordersRepository.findOrders(options);
    const last = orders.at(orders.length - 1);
    const mapped = orders.map(OrdersService.createOrderResponse);

    return { orders: mapped, length: mapped.length, cursor: last?.createdAt ?? null };
  }

  async getOrder(id: string, userId: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new ForbiddenException(`Invalid user`);
    }

    const userFilter = user.role === Role.user ? userId : undefined;
    const order = await this.ordersRepository.findOrder(id, userFilter);
    if (!order) {
      throw new NotFoundException(`No order found with id ${id}`);
    }

    return OrdersService.createOrderResponse(order);
  }

  async updateOrder(id: string, userId: string, data: UpdateOrderDto) {
    let order: FullOrder;
    switch (data.state) {
      case 'received':
        order = await this.updateOrderAsReceived(id, userId);
        break;
      case 'confirmed':
        order = await this.updateOrderAsConfirmed(id, userId, data);
        break;
      case 'canceled':
        order = await this.updateOrderAsCanceled(id, userId, data);
        break;
    }

    return OrdersService.createOrderResponse(order);
  }

  private async updateOrderAsReceived(id: string, userId: string) {
    const user = await this.usersRepository.findManager(userId);
    if (!user) {
      throw new ForbiddenException('Only managers can mark an order as received');
    }

    const order = await this.ordersRepository.findOrder(id);
    if (!order || order.state !== OrderState.confirmed) {
      throw new BadRequestException('Only confirmed orders can be transitioned into the received state');
    }

    return this.ordersRepository.updateOrderAsReceived(id)
      .catch(_ => {
        throw new NotFoundException(`Invalid order with ${id}`);
      });
  }

  private async updateOrderAsConfirmed(id: string, userId: string, data: ConfirmOrderDto) {
    const user = await this.usersRepository.findManager(userId);
    if (!user) {
      throw new ForbiddenException('Only managers can mark an order as confirmed');
    }

    const order = await this.ordersRepository.findOrder(id);
    if (!order || order.state === OrderState.received || order.state === OrderState.canceled) {
      throw new BadRequestException('Only pending orders can be transitioned into the confirmed state');
    }

    const updates = data.products ?? [];
    return this.ordersRepository.updateOrderAsConfirmed(id, updates)
      .catch(e => {
        if (e instanceof HttpException) {
          throw e;
        } else {
          throw new NotFoundException(`Invalid order or product id`);
        }
      });
  }

  private async updateOrderAsCanceled(id: string, userId: string, data: CancelOrderDto) {
    const order = await this.ordersRepository.findOrder(id);
    if (!order || order.state === OrderState.received) {
      const message = 'Only orders not in received state can be transitioned into the canceled state';
      throw new BadRequestException(message);
    }

    return this.ordersRepository.updateOrderAsCanceled(id, userId, data)
      .catch(_ => {
        throw new NotFoundException(`Invalid order`);
      });
  }
}
