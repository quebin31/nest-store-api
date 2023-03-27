import { ParseFilePipeBuilder, UploadedFiles } from '@nestjs/common';

export const ImageFiles = (mimeType?: string) => UploadedFiles(
  new ParseFilePipeBuilder()
    .addMaxSizeValidator({ maxSize: 16_000_000 })
    .addFileTypeValidator({ fileType: mimeType ?? 'image/*' })
    .build({ fileIsRequired: true }),
);
