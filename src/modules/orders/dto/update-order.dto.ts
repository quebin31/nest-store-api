import { z } from 'zod';

export const UpdateProductOrderSchema = z
  .object({
    productId: z.string().uuid(),
    quantity: z.number().positive().optional(),
    price: z.number()
      .transform(x => Number(x.toFixed(2)))
      .optional(),
  })
  .refine(
    data => data.price || data.quantity,
    `At least one of 'price' or 'quantity' must be defined`,
  );

export const ConfirmOrderSchema = z.object({
  state: z.literal('confirmed'),
  products: z.array(UpdateProductOrderSchema).optional(),
});

export const CancelOrderSchema = z.object({
  state: z.literal('canceled'),
  cancelCode: z.string().regex(/^[a-z][a-z_]+$/),
  cancelReason: z.string().min(10).max(140).optional(),
});

export const ReceivedOrderSchema = z.object({
  state: z.literal('received'),
});

export const UpdateOrderSchema = z.discriminatedUnion(
  'state',
  [
    ConfirmOrderSchema,
    CancelOrderSchema,
    ReceivedOrderSchema,
  ],
);

export type ConfirmOrderDto = z.infer<typeof ConfirmOrderSchema>
export type CancelOrderDto = z.infer<typeof CancelOrderSchema>
export type UpdateOrderDto = z.infer<typeof UpdateOrderSchema>
export type UpdateProductOrderDto = z.infer<typeof UpdateProductOrderSchema>
