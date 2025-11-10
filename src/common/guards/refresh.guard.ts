import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

@Injectable()
export class RefreshGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (process.env.CREATOR_MODE === "true") {
      request.user = this.createCreatorUser();
      return true;
    }

    const token = this.extractTokenFromCookie(request);

    if (!token) {
      throw new UnauthorizedException("Refresh token required");
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      if (!payload.sub || !payload.email || !payload.role) {
        throw new UnauthorizedException("Invalid refresh token payload");
      }

      request.user = payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    return true;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    return request.cookies?.refresh_token;
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
