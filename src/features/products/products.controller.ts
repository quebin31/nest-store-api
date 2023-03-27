import { ProductsService } from './products.service';
import { CreateProductFormDto } from './dto/create-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ImageFiles } from 'src/decorators/image-files';
import { MulterFile } from 'src/utils/multer';
import { Public } from 'src/decorators/public';
import { AuthRequest } from '../auth/jwt.strategy';
import { VerifiedGuard } from '../verification/verified.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../../decorators/roles';
import { Role } from '@prisma/client';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

@Controller({ path: '/products', version: '1' })
export class ProductsController {
  constructor(private productsService: ProductsService) {
  }

  @Public()
  @Get('/categories')
  async getAvailableCategories() {
    return this.productsService.getAvailableCategories();
  }

  @Roles(Role.manager)
  @UseGuards(VerifiedGuard, RolesGuard)
  @HttpCode(201)
  @Post('/')
  @UseInterceptors(FilesInterceptor('images', 5))
  async createProduct(
    @Body() form: CreateProductFormDto,
    @Req() req: AuthRequest,
    @ImageFiles() images: Array<MulterFile>,
  ) {
    return this.productsService.createProduct(req.user.id, form.product, images);
  }

  @Roles(Role.manager)
  @UseGuards(VerifiedGuard, RolesGuard)
  @HttpCode(200)
  @Patch('/:id')
  async updateProduct(
    @Body() data: UpdateProductDto,
    @Req() req: AuthRequest,
    @Param('id') productId: string,
  ) {
    return this.productsService.updateProduct(productId, req.user.id, data);
  }
}
