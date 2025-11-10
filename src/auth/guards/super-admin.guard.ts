import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    if (user.admin_type !== "super_admin") {
      throw new ForbiddenException("Super admin access required");
    }

    if (user.is_active === false) {
      throw new ForbiddenException("Super admin account is deactivated");
    }

    if (user.is_approved === false) {
      throw new ForbiddenException("Super admin account not approved");
    }

    return true;
  }
}
