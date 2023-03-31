import { Module } from '@nestjs/common';
import { configModuleForRoot } from './config';
import { PrismaModule } from './shared/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from './shared/redis/redis.module';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { CartItemsModule } from './modules/cart-items/cart-items.module';
import { OrdersModule } from './modules/orders/orders.module';
import { S3Module } from './shared/s3/s3.module';

@Module({
  imports: [
    configModuleForRoot(),
    EventEmitterModule.forRoot(),
    PrismaModule,
    RedisModule,
    S3Module,
    AuthModule,
    UsersModule,
    ProductsModule,
    FavoritesModule,
    CartItemsModule,
    OrdersModule,
  ],
  providers: [JwtAuthGuard.appProvider],
})
export class AppModule {
}
