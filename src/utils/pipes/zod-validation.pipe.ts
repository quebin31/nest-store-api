import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {
  }

  transform(value: any, _: ArgumentMetadata): any {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Bad Request',
        error: 'Invalid input',
        issues: result.error.issues,
      });
    } else {
      return result.data;
    }
  }
}
