import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";

@Injectable()
export class SelfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { user, params } = request;

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    if (!params.id) {
      throw new BadRequestException("Resource ID is required");
    }

    const resourceId = parseInt(params.id);
    if (isNaN(resourceId)) {
      throw new BadRequestException("Invalid resource ID");
    }

    if (resourceId === user.sub) {
      return true;
    }

    if (user.role === "admin" && user.is_approved && user.is_active) {
      return true;
    }

    if (user.role === "super_admin" && user.is_active) {
      return true;
    }

    throw new ForbiddenException("You can only access your own data");
  }
}
