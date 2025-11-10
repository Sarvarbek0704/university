import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class StudentGuard implements CanActivate {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    if (user.role !== "student") {
      throw new ForbiddenException("Student access required");
    }

    if (user.is_active === false) {
      throw new ForbiddenException("Student account is deactivated");
    }

    return true;
  }
}
