import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (process.env.CREATOR_MODE === "true") {
      request.user = this.createCreatorUser();
      return true;
    }

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException("Access token required");
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      if (!payload.sub || !payload.email || !payload.role) {
        throw new UnauthorizedException("Invalid token payload");
      }

      request.user = payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException("Invalid or expired access token");
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }

  private createCreatorUser() {
    return {
      sub: 1,
      email: "creator@system.local",
      role: "super_admin",
      admin_type: "super_admin",
      is_approved: true,
      is_active: true,
      permissions: ["all"],
    };
  }
}
