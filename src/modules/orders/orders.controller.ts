import {
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Roles } from '../../decorators/roles';
import { Role } from '@prisma/client';
import { RolesGuard } from '../auth/roles.guard';
import { AuthRequest } from '../auth/jwt.strategy';
import { GetOrdersDto } from './dto/get-orders.dto';
import { UpdateOrderDto, UpdateOrderSchema } from './dto/update-order.dto';
import { ZodBody } from '../../decorators/zod-body';

@Controller({ path: '/orders', version: '1' })
export class OrdersController {
  constructor(private ordersService: OrdersService) {
  }

  @Post('/')
  async createOrder(@Req() req: AuthRequest) {
    return this.ordersService.createOrder(req.user.id);
  }

  @Roles(Role.manager, Role.user)
  @UseGuards(RolesGuard)
  @Get('/')
  async getOrders(@Query() query: GetOrdersDto, @Req() req: AuthRequest) {
    return this.ordersService.getOrders(req.user.id, query);
  }

  @Roles(Role.manager, Role.user)
  @UseGuards(RolesGuard)
  @Get('/:id')
  async getOrder(@Param('id') orderId: string, @Req() req: AuthRequest) {
    return this.ordersService.getOrder(orderId, req.user.id);
  }

  @Roles(Role.manager, Role.user)
  @UseGuards(RolesGuard)
  @Patch('/:id')
  @HttpCode(200)
  async updateOrder(
    @Param('id') orderId: string,
    @Req() req: AuthRequest,
    @ZodBody(UpdateOrderSchema) data: UpdateOrderDto,
  ) {
    return this.ordersService.updateOrder(orderId, req.user.id, data);
  }
}
