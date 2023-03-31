import { Order, OrderCancelCode, OrderCancelReason, OrderItem, Product } from '@prisma/client';

export type FullCancelReason = OrderCancelReason & {
  code: OrderCancelCode
}

export type FullOrderItem = OrderItem & {
  product: Product
}

export type FullOrder = Order & {
  items: FullOrderItem[],
  cancelReason?: FullCancelReason | null,
}
