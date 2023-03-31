import { Body, Controller, Delete, Get, HttpCode, Patch, Post, Query, Req } from '@nestjs/common';
import { AuthRequest } from '../auth/jwt.strategy';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { GetCartItemsDto } from './dto/get-cart-items.dto';
import { CartItemsService } from './cart-items.service';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { IdParam } from '../../decorators/params';

@Controller({ path: '/cart-items.ts', version: '1' })
export class CartItemsController {
  constructor(private cartItemsService: CartItemsService) {
  }

  @Post('/')
  async addCartItem(@Body() data: AddCartItemDto, @Req() req: AuthRequest) {
    return this.cartItemsService.addCartItem(req.user.id, data);
  }

  @Get('/')
  async getCartItems(@Query() query: GetCartItemsDto, @Req() req: AuthRequest) {
    return this.cartItemsService.getCartItems(req.user.id, query);
  }

  @Patch('/:id')
  @HttpCode(200)
  async updateCartItem(
    @IdParam() productId: string,
    @Req() req: AuthRequest,
    @Body() data: UpdateCartItemDto,
  ) {
    return this.cartItemsService.updateCartItem(req.user.id, productId, data);
  }

  @Delete('/:id')
  @HttpCode(204)
  async deleteCartItem(@IdParam() productId: string, @Req() req: AuthRequest) {
    await this.cartItemsService.deleteCartItem(req.user.id, productId);
  }
}
