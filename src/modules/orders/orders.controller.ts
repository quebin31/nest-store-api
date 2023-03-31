import { Controller, Get, HttpCode, Patch, Post, Query, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Roles } from '../../decorators/roles';
import { Role } from '@prisma/client';
import { AuthRequest } from '../auth/jwt.strategy';
import { GetOrdersDto } from './dto/get-orders.dto';
import { UpdateOrderDto, UpdateOrderSchema } from './dto/update-order.dto';
import { ZodBody } from '../../decorators/zod-body';
import { IdParam } from '../../decorators/params';

@Controller({ path: '/orders', version: '1' })
export class OrdersController {
  constructor(private ordersService: OrdersService) {
  }

  @Post('/')
  async createOrder(@Req() req: AuthRequest) {
    return this.ordersService.createOrder(req.user.id);
  }

  @Roles(Role.manager, Role.user)
  @Get('/')
  async getOrders(@Query() query: GetOrdersDto, @Req() req: AuthRequest) {
    return this.ordersService.getOrders(req.user.id, query);
  }

  @Roles(Role.manager, Role.user)
  @Get('/:id')
  async getOrder(@IdParam() orderId: string, @Req() req: AuthRequest) {
    return this.ordersService.getOrder(orderId, req.user.id);
  }

  @Roles(Role.manager, Role.user)
  @Patch('/:id')
  @HttpCode(200)
  async updateOrder(
    @IdParam() orderId: string,
    @Req() req: AuthRequest,
    @ZodBody(UpdateOrderSchema) data: UpdateOrderDto,
  ) {
    return this.ordersService.updateOrder(orderId, req.user.id, data);
  }
}
