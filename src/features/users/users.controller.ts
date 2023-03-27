import { Body, Controller, Get, Param, Patch, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthRequest, OptionalAuthRequest } from '../auth/jwt.strategy';
import { Public } from '../../decorators/public';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller({ path: '/users', version: '1' })
export class UsersController {
  constructor(private usersService: UsersService) {
  }

  @Public({ optionalAuth: true })
  @Get('/:id')
  async getUser(@Req() req: OptionalAuthRequest, @Param('id') id: string) {
    const isOwner = req.user?.id === id;
    return this.usersService.findById(id, isOwner);
  }

  @Patch('/')
  async updateUser(@Req() req: AuthRequest, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(req.user.id, updateUserDto);
  }
}
