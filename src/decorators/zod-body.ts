import { Body } from '@nestjs/common';
import { ZodValidationPipe } from '../utils/pipes/zod-validation.pipe';
import { ZodSchema } from 'zod';

export const ZodBody = (schema: ZodSchema) => Body(new ZodValidationPipe(schema));
