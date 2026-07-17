import { Matches, MaxLength, MinLength } from 'class-validator';
import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH, USERNAME_PATTERN } from '@scaffold/shared-types';

export class RegisterDto {
  @MinLength(USERNAME_MIN_LENGTH)
  @MaxLength(USERNAME_MAX_LENGTH)
  @Matches(USERNAME_PATTERN, {
    message: 'Username may only contain letters, numbers, and underscores',
  })
  username!: string;
}
