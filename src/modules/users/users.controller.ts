import { Body, Controller, Get, HttpCode, Patch, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthRequest, OptionalAuthRequest } from '../auth/jwt.strategy';
import { Public } from '../../decorators/public';
import { UpdateUserDto } from './dto/update-user.dto';
import { IdParam } from '../../decorators/params';

@Controller({ path: '/users', version: '1' })
export class UsersController {
  constructor(private usersService: UsersService) {
  }

  @Public({ optionalAuth: true })
  @Get('/:id')
  async getUser(@Req() req: OptionalAuthRequest, @IdParam() id: string) {
    const isOwner = req.user?.id === id;
    return this.usersService.findById(id, isOwner);
  }

  @HttpCode(200)
  @Patch('/')
  async updateUser(@Req() req: AuthRequest, @Body() data: UpdateUserDto) {
    return this.usersService.updateUser(req.user.id, data);
  }
}
