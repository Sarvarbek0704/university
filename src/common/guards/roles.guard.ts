import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      "roles",
      context.getHandler()
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    if (user.is_active === false) {
      throw new ForbiddenException("Account is deactivated");
    }

    if (user.role === "admin" && user.is_approved === false) {
      throw new ForbiddenException("Admin account not approved yet");
    }

    if (user.role === "admin" && user.admin_type) {
      if (requiredRoles.includes(user.admin_type)) {
        return true;
      }
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Required roles: ${requiredRoles.join(", ")}`
      );
    }

    return true;
  }
}
