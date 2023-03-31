import { UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

export const ProductImages = (maxCount: number) => {
  return maxCount !== 1
    ? UseInterceptors(FilesInterceptor('images', maxCount))
    : UseInterceptors(FileInterceptor('image'));
};
