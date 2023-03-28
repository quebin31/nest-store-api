import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type GetFavorites = {
  sort: 'desc' | 'asc',
  user: string,
}

@Injectable()
export class FavoritesRepository {
  constructor(private prismaService: PrismaService) {
  }

  async addToFavorites(userId: string, productId: string) {
    return this.prismaService.productUserFavorite.create({
      data: {
        product: { connect: { id: productId } },
        user: { connect: { id: userId } },
      },
      include: {
        product: { include: { images: true } },
      },
    });
  }

  async getFavorites(options: GetFavorites) {
    return this.prismaService.productUserFavorite.findMany({
      where: { userId: options.user },
      orderBy: { createdAt: options.sort },
      include: {
        product: { include: { images: true } },
      },
    });
  }

  async deleteFavorite(userId: string, productId: string) {
    return this.prismaService.productUserFavorite.delete({
      where: { userId_productId: { userId, productId } },
    });
  }
}
