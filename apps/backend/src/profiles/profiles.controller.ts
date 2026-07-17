import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import type { PublicProfile } from '@scaffold/shared-types';
import { toPublicProfile } from '../users/user.mapper';
import { UsersService } from '../users/users.service';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':username')
  async getByUsername(@Param('username') username: string): Promise<PublicProfile> {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new NotFoundException(`No profile found for @${username}`);
    }
    return toPublicProfile(user);
  }
}
