import { Module } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { RepositoriesModule } from '../../shared/repositories.module';

@Module({
  imports: [RepositoriesModule],
  providers: [OrdersRepository, OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {
}
