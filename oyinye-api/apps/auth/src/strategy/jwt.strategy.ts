import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { Request } from "express";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @InjectRepository(User) private userRepository: Repository<User>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => {
          return request?.access_token;
        },
        // JwtStrategy.extractFromHeaderOrCookie
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow('JWT_SECRET'),
    });
  }

  private static extractFromHeaderOrCookie(req: Request): string | null {
    // Fallback to cookie
    if (req.cookies && req.cookies['access_token'] && req.cookies['access_token'].length > 0) {
      return req.cookies['access_token'];
    }

    return null;
  }

  async validate(payload: { sub: string; email?: string }) {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (user) {
      delete user.password;
    }

    return user;
  }
}
