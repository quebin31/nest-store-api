import { Module, ModuleMetadata } from '@nestjs/common';
import { configModuleForRoot } from './config';

const moduleMetadata: ModuleMetadata = {
  imports: [configModuleForRoot()],
};

@Module(moduleMetadata)
export class AppModule {
}
