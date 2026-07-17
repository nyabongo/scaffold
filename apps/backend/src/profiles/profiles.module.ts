import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { ProfilesController } from './profiles.controller';

@Module({
  imports: [UsersModule],
  controllers: [ProfilesController],
})
export class ProfilesModule {}
