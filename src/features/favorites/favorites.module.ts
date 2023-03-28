import { Module } from '@nestjs/common';
import { FavoritesController } from './favorites.controller';
import { FavoritesRepository } from './favorites.repository';
import { FavoritesService } from './favorites.service';
import { ProductsRepository } from '../products/products.repository';

@Module({
  providers: [ProductsRepository, FavoritesRepository, FavoritesService],
  controllers: [FavoritesController],
})
export class FavoritesModule {
}
