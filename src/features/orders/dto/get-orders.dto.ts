import { ArrayUnique, IsDate, IsIn, IsOptional, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { OrderState } from '@prisma/client';
import { IsUUIDOrSelf } from 'src/decorators/validation/is-uuid-or-self';

export class GetOrdersDto {

  @IsOptional()
  @IsIn(['desc', 'asc'])
  sort: 'desc' | 'asc' = 'desc';

  @IsOptional()
  @IsDate()
  cursor?: Date;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @Min(10)
  @Max(50)
  take = 25;

  @IsOptional()
  @Transform(({ value }: { value: string }) => value.split(',').map(it => it.trim()))
  @IsIn(Object.values(OrderState), { each: true })
  @ArrayUnique()
  state: OrderState[] = [OrderState.pending];

  @IsOptional()
  @IsUUIDOrSelf()
  user?: string;
}
