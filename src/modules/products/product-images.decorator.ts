import { UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

export const ProductImages = (maxCount: number) => {
  return UseInterceptors(FilesInterceptor('images', maxCount));
};
