import { Injectable, NotFoundException } from '@nestjs/common';
import { FavoritesRepository, GetFavorites } from './favorites.repository';
import { ProductUserFavorite } from '@prisma/client';
import { FullProduct, ProductsService } from '../products/products.service';
import { GetFavoritesDto } from './dto/get-favorites.dto';

export type FullFavorite = ProductUserFavorite & { product: FullProduct }

@Injectable()
export class FavoritesService {
  constructor(private favoritesRepository: FavoritesRepository) {
  }

  static createFavoriteResponse(favorite: FullFavorite) {
    return {
      createdAt: favorite.createdAt,
      product: ProductsService.createProductResponse(favorite.product),
    };
  }

  async addToFavorites(userId: string, productId: string) {
    const favorite = await this.favoritesRepository.addToFavorites(userId, productId)
      .catch(_ => {
        throw new NotFoundException(`Couldn't find user or product`);
      });

    return FavoritesService.createFavoriteResponse(favorite);
  }

  async getFavorites(userId: string, getFavoritesDto: GetFavoritesDto) {
    const options: GetFavorites = {
      sort: getFavoritesDto.sort,
      user: userId,
    };

    const favorites = await this.favoritesRepository.getFavorites(options);
    return favorites.map(FavoritesService.createFavoriteResponse);
  }

  async deleteFavorite(userId: string, productId: string) {
    await this.favoritesRepository.deleteFavorite(userId, productId)
      .catch(_ => {
        throw new NotFoundException(`Couldn't find user favorite`);
      });
  }
}