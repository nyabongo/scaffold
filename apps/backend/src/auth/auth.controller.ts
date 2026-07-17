import { Body, Controller, Get, NotFoundException, Post, UseGuards } from '@nestjs/common';
import type { AuthMeResponse, UserProfile } from '@scaffold/shared-types';
import { UsersService } from '../users/users.service';
import { toUserProfile } from '../users/user.mapper';
import { CurrentUser } from './current-user.decorator';
import { RegisterDto } from './dto/register.dto';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import type { AuthenticatedUser } from './firebase-auth.guard';

@Controller('auth')
@UseGuards(FirebaseAuthGuard)
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async me(@CurrentUser() authUser: AuthenticatedUser): Promise<AuthMeResponse> {
    const user = await this.usersService.findByFirebaseUid(authUser.uid);
    if (!user) {
      throw new NotFoundException('No profile for this account yet');
    }
    return { authenticated: true, user: toUserProfile(user) };
  }

  @Post('register')
  async register(
    @CurrentUser() authUser: AuthenticatedUser,
    @Body() dto: RegisterDto,
  ): Promise<UserProfile> {
    const user = await this.usersService.register(authUser.uid, dto.username);
    return toUserProfile(user);
  }
}
