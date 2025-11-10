import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    if (!user.is_approved) {
      throw new ForbiddenException("Admin account not approved yet");
    }

    if (user.is_active === false) {
      throw new ForbiddenException("Admin account is deactivated");
    }

    return true;
  }
}
