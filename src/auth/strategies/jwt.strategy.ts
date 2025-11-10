import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get("JWT_ACCESS_SECRET"),
    });
  }

  async validate(payload: any) {
    if (!payload.sub || !payload.email || !payload.role) {
      throw new UnauthorizedException("Invalid token payload");
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      admin_type: payload.admin_type,
      is_approved: payload.is_approved,
      is_active: payload.is_active,
      permissions: payload.permissions || [],
    };
  }
}
