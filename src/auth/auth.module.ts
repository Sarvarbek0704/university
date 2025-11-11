import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { AdminModule } from "../admin/admin.module";
import { TeachersModule } from "../teachers/teachers.module";
import { StudentsModule } from "../students/students.module";
import { MailService } from "../common/services/mail.service";
import { OtpService } from "../common/services/otp.service";
import { CustomLogger } from "../common/services/logger.service";

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get("JWT_ACCESS_SECRET"),
        signOptions: {
          expiresIn: configService.get("JWT_ACCESS_EXPIRES_IN") || "15m",
        },
      }),
      inject: [ConfigService],
    }),
    AdminModule,
    TeachersModule,
    StudentsModule,
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, MailService, OtpService, CustomLogger],
  exports: [AuthService],
})
export class AuthModule {}
