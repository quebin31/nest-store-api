import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { ProductState } from '@prisma/client';
import { GetFavoritesDto } from './dto/get-favorites.dto';
import { FullFavorite } from '../../types/favorites';

export type GetFavorites = GetFavoritesDto & { user: string }

@Injectable()
export class FavoritesRepository {
  constructor(private prismaService: PrismaService) {
  }

  async findProductById(id: string) {
    return this.prismaService.product.findFirst({
      where: { id, state: { not: ProductState.deleted } },
    });
  }

  async addToFavorites(userId: string, productId: string): Promise<FullFavorite> {
    return this.prismaService.productUserFavorite.create({
      data: {
        product: { connect: { id: productId } },
        user: { connect: { id: userId } },
      },
      include: {
        product: {
          include: { images: { orderBy: { createdAt: 'desc' } } },
        },
      },
    });
  }

  async findFavorites(options: GetFavorites): Promise<FullFavorite[]> {
    return this.prismaService.productUserFavorite.findMany({
      where: {
        userId: options.user,
        product: {
          state: { not: ProductState.deleted },
        },
      },
      orderBy: { createdAt: options.sort },
      include: {
        product: {
          include: { images: { orderBy: { createdAt: 'desc' } } },
        },
      },
    });
  }

  async deleteFavorite(userId: string, productId: string) {
    return this.prismaService.productUserFavorite.delete({
      where: { userId_productId: { userId, productId } },
    });
  }
}
