import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query, Req } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { AddToFavoritesDto } from './dto/add-to-favorites.dto';
import { AuthRequest } from '../auth/jwt.strategy';
import { GetFavoritesDto } from './dto/get-favorites.dto';

@Controller({ path: '/favorites', version: '1' })
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {
  }

  @Post('/')
  async addToFavorites(@Body() addToFavoriteDto: AddToFavoritesDto, @Req() req: AuthRequest) {
    return this.favoritesService.addToFavorites(req.user.id, addToFavoriteDto.productId);
  }

  @Get('/')
  async getFavorites(@Query() getFavoritesDto: GetFavoritesDto, @Req() req: AuthRequest) {
    return this.favoritesService.getFavorites(req.user.id, getFavoritesDto);
  }

  @Delete('/:id')
  @HttpCode(204)
  async deleteFavorite(@Param('id') productId: string, @Req() req: AuthRequest) {
    await this.favoritesService.deleteFavorite(req.user.id, productId);
  }
}
