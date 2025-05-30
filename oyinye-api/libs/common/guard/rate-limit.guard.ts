// src/common/guards/rate-limit.guard.ts

import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly ratelimit: Ratelimit;

  constructor(private readonly configService: ConfigService) {
    const redis = new Redis({
      url: this.configService.get<string>('UPSTASH_REDIS_REST_URL')!,
      token: this.configService.get<string>('UPSTASH_REDIS_REST_TOKEN')!,
    });

    this.ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(5, "10s"), // 5 requests per 10 seconds
      analytics: true,
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.headers["x-forwarded-for"];

    const { success, limit, remaining, reset } = await this.ratelimit.limit(ip);

    if (!success) {
      const response = context.switchToHttp().getResponse();
      response.setHeader("X-RateLimit-Limit", limit);
      response.setHeader("X-RateLimit-Remaining", remaining);
      response.setHeader("X-RateLimit-Reset", reset);
      throw new HttpException(
        `Rate limit exceeded. Try again in ${reset - Date.now()}ms`,
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    return true;
  }
}
