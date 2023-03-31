import { Module } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { SharedUsersModule } from '../../shared/users/users.module';

@Module({
  controllers: [OrdersController],
  imports: [SharedUsersModule],
  providers: [OrdersRepository, OrdersService],
})
export class OrdersModule {
}
