import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { TokenExpiredError } from "jsonwebtoken";

@Injectable()
export class JwtAuthGaurd extends AuthGuard("jwt") {

}
