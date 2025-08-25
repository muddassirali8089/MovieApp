import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'your-super-secret-jwt-key-here', // This should come from environment variables
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findOne(payload.id);
    if (!user) {
      throw new UnauthorizedException(
        'The user belonging to this token no longer exists.',
      );
    }
    return user;
  }
}
