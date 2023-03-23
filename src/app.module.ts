import { Module, ModuleMetadata } from '@nestjs/common';

const moduleMetadata: ModuleMetadata = {
  imports: [],
};

@Module(moduleMetadata)
export class AppModule {
}
