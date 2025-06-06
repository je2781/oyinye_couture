import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { catchError, Observable, tap } from "rxjs";
import { AUTH_SERVICE } from "./constants/service";

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(@Inject(AUTH_SERVICE) private authClient: ClientProxy) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const authentication = this.getAuthentication(context);
    return this.authClient
      .send("validate_user", {
        access_token: authentication,
      })
      .pipe(
        tap((res) => {
          this.addUser(res, context);
        }),
        catchError(() => {
          throw new UnauthorizedException();
        })
      );
  }

  private getAuthentication(context: ExecutionContext) {
    let authentication: string | null = null;
    if (context.getType() === "rpc") {
      authentication = context.switchToRpc().getData().access_token;
    } else if (context.getType() === "http") {
      const request = context.switchToHttp().getRequest();

      // 1. Try cookie
      if (request.cookies?.access_token) {
        authentication = request.cookies.access_token;
      }

      // 2. Try Authorization header
      const authHeader = request.headers["Authorization"];
      if (
        authHeader &&
        typeof authHeader === "string" &&
        authHeader.startsWith("Bearer ")
      ) {
        authentication = authHeader.split(" ")[1]; // Extract token after 'Bearer '
      }
    }
    if (!authentication) {
      throw new UnauthorizedException(
        "No value was provided for Authentication"
      );
    }
    return authentication;
  }

  private addUser(user: any, context: ExecutionContext) {
    if (context.getType() === "rpc") {
      context.switchToRpc().getData().user = user;
    } else if (context.getType() === "http") {
      context.switchToHttp().getRequest().user = user;
    }
  }
}
