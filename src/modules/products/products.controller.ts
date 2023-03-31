import { ProductsService } from './products.service';
import { CreateProductFormDto } from './dto/create-product.dto';
import { ImageFiles } from 'src/decorators/image-files';
import { MulterFile } from 'src/utils/multer';
import { Public } from 'src/decorators/public';
import { AuthRequest } from '../auth/jwt.strategy';
import { Roles } from '../../decorators/roles';
import { Role } from '@prisma/client';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsDto } from './dto/get-products.dto';
import { Body, Controller, Delete, Get, HttpCode, Patch, Post, Query, Req } from '@nestjs/common';
import { VerifiedUser } from '../../decorators/verified';
import { ProductImages } from './images/product-images.decorator';
import { IdParam } from '../../decorators/params';

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
  @HttpCode(201)
  @Post('/')
  @ProductImages(5)
  async createProduct(
    @Body() form: CreateProductFormDto,
    @Req() req: AuthRequest,
    @ImageFiles() images: Array<MulterFile>,
  ) {
    return this.productsService.createProduct(req.user.id, form.product, images);
  }

  @Public()
  @Get('/:id')
  async getProduct(@IdParam() productId: string) {
    return this.productsService.getProduct(productId);
  }

  @Public()
  @Get('/')
  async getProducts(@Query() query: GetProductsDto) {
    return this.productsService.getProducts(query);
  }

  @Roles(Role.manager)
  @VerifiedUser()
  @HttpCode(200)
  @Patch('/:id')
  async updateProduct(
    @Body() data: UpdateProductDto,
    @Req() req: AuthRequest,
    @IdParam() productId: string,
  ) {
    return this.productsService.updateProduct(productId, req.user.id, data);
  }

  @Roles(Role.manager)
  @VerifiedUser()
  @HttpCode(200)
  @Delete('/:id')
  async deleteProduct(@Req() req: AuthRequest, @IdParam() productId: string) {
    await this.productsService.deleteProduct(productId, req.user.id);
  }
}
