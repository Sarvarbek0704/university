import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcryptjs";
import { AdminService } from "../admin/admin.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterAdminDto } from "./dto/register-admin.dto";
import { VerifyAdminDto } from "./dto/verify-admin.dto";
import { TeacherService } from "../teachers/teachers.service";
import { RegisterTeacherDto } from "./dto/register-teacher.dto";
import { StudentService } from "../students/students.service";
import { RegisterStudentDto } from "./dto/register-student.dto";
import { CookieService } from "../common/services/cookie.service";
import { MailService } from "../common/services/mail.service";
import { OtpService } from "../common/services/otp.service";
import { InjectConnection } from "@nestjs/sequelize";
import { Sequelize, QueryTypes } from "sequelize";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { CustomLogger } from "../common/services/logger.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly adminService: AdminService,
    private readonly teacherService: TeacherService,
    private readonly studentService: StudentService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly cookieService: CookieService,
    private readonly mailService: MailService,
    private readonly otpService: OtpService,
    @InjectConnection()
    private readonly sequelize: Sequelize,
    private readonly logger: CustomLogger
  ) {}

  async registerAdmin(registerAdminDto: RegisterAdminDto) {
    try {
      const otp = this.otpService.generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      const adminData = {
        ...registerAdminDto,
        verification_otp: otp,
        otp_expires_at: otpExpires,
        is_email_verified: false,
      };

      const admin = await this.adminService.create(adminData);

      try {
        await this.mailService.sendVerificationEmail(
          registerAdminDto.email,
          otp,
          registerAdminDto.full_name
        );
      } catch (emailError) {}

      return {
        message:
          "Admin registered successfully. Please verify your email with the OTP sent to your email.",
        admin: {
          id: admin.id,
          full_name: admin.full_name,
          email: admin.email,
          admin_type: admin.admin_type,
          is_approved: admin.is_approved,
          is_email_verified: false,
        },
      };
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException("Registration failed");
    }
  }

  async verifyEmail(
    email: string,
    otp: string,
    userType: "admin" | "teacher" | "student"
  ) {
    try {
      if (!email || !otp || !userType) {
        throw new BadRequestException("Email, OTP and user type are required");
      }

      let tableName: string;
      switch (userType) {
        case "admin":
          tableName = "admins";
          break;
        case "teacher":
          tableName = "teachers";
          break;
        case "student":
          tableName = "students";
          break;
        default:
          throw new BadRequestException("Invalid user type");
      }

      const query = `
        SELECT 
          id, 
          "verification_otp", 
          "otp_expires_at",
          "is_email_verified"
        FROM "${tableName}" 
        WHERE email = :email AND "deletedAt" IS NULL
        LIMIT 1
      `;

      const [userData] = await this.sequelize.query(query, {
        replacements: { email },
        type: QueryTypes.SELECT,
      });

      if (!userData) {
        throw new NotFoundException(`${userType} not found`);
      }

      const { id, verification_otp, otp_expires_at, is_email_verified } =
        userData as any;

      if (is_email_verified) {
        throw new BadRequestException("Email already verified");
      }

      if (!verification_otp) {
        throw new BadRequestException("OTP expired or invalid");
      }

      if (verification_otp !== otp) {
        throw new BadRequestException("Invalid OTP");
      }

      const otpExpiryDate = new Date(otp_expires_at);
      const now = new Date();

      if (otpExpiryDate < now) {
        throw new BadRequestException("OTP expired or invalid");
      }

      const updateQuery = `
        UPDATE "${tableName}" 
        SET 
          "is_email_verified" = true,
          "verification_otp" = NULL,
          "otp_expires_at" = NULL,
          "updatedAt" = NOW()
        WHERE id = :id
      `;

      await this.sequelize.query(updateQuery, {
        replacements: { id },
        type: QueryTypes.UPDATE,
      });

      return {
        message: "Email verified successfully",
        [userType]: {
          id,
          email,
          is_email_verified: true,
        },
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException("Email verification failed");
    }
  }

  async resendOTP(email: string, userType: "admin" | "teacher" | "student") {
    try {
      if (!email || !userType) {
        throw new BadRequestException("Email and user type are required");
      }

      let user: any;

      switch (userType) {
        case "admin":
          user = await this.adminService.findOneByEmail(email);
          break;
        case "teacher":
          user = await this.teacherService.findOneByEmail(email);
          break;
        case "student":
          user = await this.studentService.findOneByEmail(email);
          break;
        default:
          throw new BadRequestException("Invalid user type");
      }

      if (!user) {
        throw new NotFoundException(`${userType} not found`);
      }

      if (user.getDataValue("is_email_verified")) {
        throw new BadRequestException("Email already verified");
      }

      const otp = this.otpService.generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      await user.update({
        verification_otp: otp,
        otp_expires_at: otpExpires,
      });

      await this.mailService.sendVerificationEmail(
        email,
        otp,
        user.getDataValue("full_name")
      );

      return {
        message: "OTP sent successfully to your email",
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException("Failed to resend OTP");
    }
  }

  async login(
    loginDto: LoginDto,
    userType: "admin" | "teacher" | "student",
    response: any
  ) {
    try {
      if (!loginDto?.email || !loginDto?.password) {
        throw new BadRequestException("Email and password are required");
      }

      let user: any;
      let service: any;

      switch (userType) {
        case "admin":
          user = await this.adminService.findOneByEmail(loginDto.email);
          service = this.adminService;
          break;
        case "teacher":
          user = await this.teacherService.findOneByEmail(loginDto.email);
          service = this.teacherService;
          break;
        case "student":
          user = await this.studentService.findOneByEmail(loginDto.email);
          service = this.studentService;
          break;
        default:
          throw new BadRequestException("Invalid user type");
      }

      const userPassword = user.getDataValue
        ? user.getDataValue("password")
        : user.password;
      if (!userPassword) {
        throw new UnauthorizedException("Invalid credentials");
      }

      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        userPassword
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException("Invalid credentials");
      }

      const isEmailVerified = user.getDataValue
        ? user.getDataValue("is_email_verified")
        : user.is_email_verified;
      if (!isEmailVerified) {
        throw new ForbiddenException("Please verify your email first");
      }

      const isApproved = user.getDataValue
        ? user.getDataValue("is_approved")
        : user.is_approved;
      if (!isApproved) {
        throw new ForbiddenException("Account not approved yet");
      }

      const isActive = user.getDataValue
        ? user.getDataValue("is_active")
        : user.is_active;
      if (!isActive) {
        throw new ForbiddenException("Account is deactivated");
      }

      const userId = user.getDataValue ? user.getDataValue("id") : user.id;
      const userEmail = user.getDataValue
        ? user.getDataValue("email")
        : user.email;

      const tokens = await this.generateTokens({
        id: userId,
        email: userEmail,
        role: userType,
        admin_type: user.getDataValue
          ? user.getDataValue("admin_type")
          : user.admin_type,
        is_approved: isApproved,
        is_active: isActive,
      });

      await service.updateTokens(userId, {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      });

      this.cookieService.setRefreshToken(
        response,
        userType,
        tokens.refresh_token
      );

      return {
        message: "Login successful",
        user: this.sanitizeUser(user, userType),
        access_token: tokens.access_token,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException("Login failed");
    }
  }

  private sanitizeUser(user: any, userType: string) {
    const getValue = (key: string) =>
      user.getDataValue ? user.getDataValue(key) : user[key];

    const baseInfo = {
      id: getValue("id"),
      full_name: getValue("full_name"),
      email: getValue("email"),
      is_approved: getValue("is_approved"),
      is_active: getValue("is_active"),
      is_email_verified: getValue("is_email_verified"),
    };

    switch (userType) {
      case "admin":
        return {
          ...baseInfo,
          admin_type: getValue("admin_type"),
          phone: getValue("phone"),
        };
      case "teacher":
        return {
          ...baseInfo,
          academic_degree: getValue("academic_degree"),
          position: getValue("position"),
          phone: getValue("phone"),
        };
      case "student":
        return {
          ...baseInfo,
          phone: getValue("phone"),
          balance: getValue("balance"),
        };
      default:
        return baseInfo;
    }
  }

  async verifyAdmin(verifyAdminDto: VerifyAdminDto, currentAdmin: any) {
    try {
      if (!verifyAdminDto?.admin_id) {
        throw new BadRequestException("Admin ID is required");
      }

      if (currentAdmin.admin_type !== "super_admin") {
        throw new ForbiddenException("Only super admin can verify admins");
      }

      const admin = await this.adminService.findOne(verifyAdminDto.admin_id);

      await admin.update({
        is_approved: verifyAdminDto.is_approved,
      });

      if (verifyAdminDto.is_approved) {
        await this.mailService.sendApprovalEmail(
          admin.email,
          admin.full_name,
          "Admin"
        );
      }

      return {
        message: `Admin ${verifyAdminDto.is_approved ? "approved" : "rejected"} successfully`,
        admin: {
          id: admin.id,
          full_name: admin.full_name,
          email: admin.email,
          is_approved: verifyAdminDto.is_approved,
        },
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException("Verification failed");
    }
  }

  async logout(
    response: any,
    userType?: "admin" | "teacher" | "student"
  ): Promise<{ message: string }> {
    try {
      const cookieName = this.cookieService.getCookieName(userType || "admin");
      const request = response.req;

      const existingToken = this.cookieService.getRefreshToken(
        request,
        userType || "admin"
      );

      if (!existingToken) {
        return { message: "Already logged out" };
      }

      this.cookieService.clearRefreshToken(response, userType || "admin");
      return { message: "Logout successful" };
    } catch (error) {
      throw new InternalServerErrorException("Logout failed");
    }
  }

  async refreshTokens(
    refreshToken: string | null,
    userType: "admin" | "teacher" | "student",
    response: any
  ) {
    try {
      if (!refreshToken) {
        const request = response.req;
        refreshToken = this.cookieService.getRefreshToken(request, userType);

        if (!refreshToken) {
          throw new UnauthorizedException("Refresh token not found");
        }
      }

      let payload: any;
      try {
        payload = await this.jwtService.verifyAsync(refreshToken, {
          secret: this.configService.get("JWT_REFRESH_SECRET"),
        });
      } catch (jwtError) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      let user: any;
      let service: any;

      switch (userType) {
        case "admin":
          user = await this.adminService.findOne(payload.sub);
          service = this.adminService;
          break;
        case "teacher":
          user = await this.teacherService.findOne(payload.sub);
          service = this.teacherService;
          break;
        case "student":
          user = await this.studentService.findOne(payload.sub);
          service = this.studentService;
          break;
        default:
          throw new BadRequestException("Invalid user type");
      }

      if (!user) {
        throw new NotFoundException(`${userType} not found`);
      }

      const isApproved = user.getDataValue
        ? user.getDataValue("is_approved")
        : user.is_approved;
      const isActive = user.getDataValue
        ? user.getDataValue("is_active")
        : user.is_active;
      const isEmailVerified = user.getDataValue
        ? user.getDataValue("is_email_verified")
        : user.is_email_verified;

      if (!isApproved) {
        throw new ForbiddenException("Account not approved");
      }
      if (!isActive) {
        throw new ForbiddenException("Account is deactivated");
      }
      if (!isEmailVerified) {
        throw new ForbiddenException("Email not verified");
      }

      const dbRefreshToken = user.getDataValue
        ? user.getDataValue("refreshToken")
        : user.refreshToken;

      if (!dbRefreshToken || dbRefreshToken !== refreshToken) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      const tokens = await this.generateTokens({
        id: payload.sub,
        email: payload.email,
        role: userType,
        admin_type: user.getDataValue
          ? user.getDataValue("admin_type")
          : user.admin_type,
        is_approved: isApproved,
        is_active: isActive,
      });

      await service.updateTokens(payload.sub, {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      });

      this.cookieService.setRefreshToken(
        response,
        userType,
        tokens.refresh_token
      );

      return {
        access_token: tokens.access_token,
      };
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException("Token refresh failed");
    }
  }

  async refreshAdminTokens(refreshToken: string | null, response: any) {
    return this.refreshTokens(refreshToken, "admin", response);
  }

  private async generateTokens(payload: any) {
    const tokenPayload = {
      sub: payload.id,
      email: payload.email,
      role: payload.role,
      admin_type: payload.admin_type,
      is_approved: payload.is_approved,
      is_active: payload.is_active,
    };

    const accessToken = await this.jwtService.signAsync(tokenPayload, {
      secret: this.configService.get("JWT_ACCESS_SECRET"),
      expiresIn: this.configService.get("JWT_ACCESS_EXPIRES_IN") || "15m",
    });

    const refreshToken = await this.jwtService.signAsync(tokenPayload, {
      secret: this.configService.get("JWT_REFRESH_SECRET"),
      expiresIn: this.configService.get("JWT_REFRESH_EXPIRES_IN") || "7d",
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async registerTeacher(registerTeacherDto: RegisterTeacherDto) {
    try {
      const otp = this.otpService.generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      const teacherData = {
        ...registerTeacherDto,
        verification_otp: otp,
        otp_expires_at: otpExpires,
        is_email_verified: false,
      };

      const teacher = await this.teacherService.create(teacherData);

      await this.mailService.sendVerificationEmail(
        registerTeacherDto.email,
        otp,
        registerTeacherDto.full_name
      );

      return {
        message:
          "Teacher registered successfully. Please verify your email with the OTP sent to your email.",
        teacher: {
          id: teacher.id,
          full_name: teacher.full_name,
          email: teacher.email,
          academic_degree: teacher.academic_degree,
          position: teacher.position,
          is_approved: teacher.is_approved,
          is_email_verified: false,
        },
      };
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException("Registration failed");
    }
  }

  async teacherLogin(loginDto: LoginDto, response: any) {
    return this.login(loginDto, "teacher", response);
  }

  async refreshTeacherTokens(refreshToken: string | null, response: any) {
    return this.refreshTokens(refreshToken, "teacher", response);
  }

  async teacherLogout(response: any) {
    return this.logout(response, "teacher");
  }

  async verifyTeacher(
    teacherId: number,
    isApproved: boolean,
    currentAdmin: any
  ) {
    try {
      if (!teacherId) {
        throw new BadRequestException("Teacher ID is required");
      }

      if (currentAdmin.admin_type !== "super_admin") {
        throw new ForbiddenException("Only super admin can verify teachers");
      }

      const teacher = await this.teacherService.findOne(teacherId);

      await this.teacherService.update(teacherId, {
        is_approved: isApproved,
      });

      if (isApproved) {
        await this.mailService.sendApprovalEmail(
          teacher.getDataValue("email"),
          teacher.getDataValue("full_name"),
          "Teacher"
        );
      }

      return {
        message: `Teacher ${isApproved ? "approved" : "rejected"} successfully`,
        teacher: {
          id: teacher.id,
          full_name: teacher.getDataValue("full_name"),
          email: teacher.getDataValue("email"),
          is_approved: isApproved,
        },
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException("Verification failed");
    }
  }

  async registerStudent(registerStudentDto: RegisterStudentDto) {
    try {
      const otp = this.otpService.generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      const studentData = {
        ...registerStudentDto,
        verification_otp: otp,
        otp_expires_at: otpExpires,
        is_email_verified: false,
      };

      const student = await this.studentService.create(studentData);

      await this.mailService.sendVerificationEmail(
        registerStudentDto.email,
        otp,
        registerStudentDto.full_name
      );

      return {
        message:
          "Student registered successfully. Please verify your email with the OTP sent to your email.",
        student: {
          id: student.id,
          full_name: student.full_name,
          email: student.email,
          phone: student.phone,
          is_approved: student.is_approved,
          is_email_verified: false,
        },
      };
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException("Registration failed");
    }
  }

  async studentLogin(loginDto: LoginDto, response: any) {
    return this.login(loginDto, "student", response);
  }

  async refreshStudentTokens(refreshToken: string | null, response: any) {
    return this.refreshTokens(refreshToken, "student", response);
  }

  async studentLogout(response: any) {
    return this.logout(response, "student");
  }

  async verifyStudent(
    studentId: number,
    isApproved: boolean,
    currentAdmin: any
  ) {
    try {
      if (!studentId) {
        throw new BadRequestException("Student ID is required");
      }

      if (currentAdmin.admin_type !== "super_admin") {
        throw new ForbiddenException("Only super admin can verify students");
      }

      const student = await this.studentService.findOne(studentId);

      await this.studentService.update(studentId, {
        is_approved: isApproved,
      });

      if (isApproved) {
        await this.mailService.sendApprovalEmail(
          student.getDataValue("email"),
          student.getDataValue("full_name"),
          "Student"
        );
      }

      return {
        message: `Student ${isApproved ? "approved" : "rejected"} successfully`,
        student: {
          id: student.id,
          full_name: student.getDataValue("full_name"),
          email: student.getDataValue("email"),
          is_approved: isApproved,
        },
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException("Verification failed");
    }
  }

  async requestPasswordReset(
    email: string,
    userType: "admin" | "teacher" | "student"
  ): Promise<{ message: string }> {
    try {
      let user: any;

      switch (userType) {
        case "admin":
          user = await this.adminService.findOneByEmail(email);
          break;
        case "teacher":
          user = await this.teacherService.findOneByEmail(email);
          break;
        case "student":
          user = await this.studentService.findOneByEmail(email);
          break;
        default:
          throw new BadRequestException("Invalid user type");
      }

      if (!user) {
        return { message: "If the email exists, a reset link has been sent" };
      }

      const resetToken = this.jwtService.sign(
        { sub: user.id, email: user.email, type: userType },
        {
          secret: process.env.JWT_ACCESS_SECRET + "_RESET",
          expiresIn: "1h",
        }
      );

      await this.updateUserResetToken(userType, user.id, resetToken);

      await this.mailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        user.full_name
      );

      return { message: "If the email exists, a reset link has been sent" };
    } catch (error) {
      this.logger.error(`Password reset request failed for ${email}`, error);
      return { message: "If the email exists, a reset link has been sent" };
    }
  }

  async resetPassword(
    resetToken: string,
    newPassword: string,
    userType: "admin" | "teacher" | "student"
  ): Promise<{ message: string }> {
    try {
      let payload: any;
      try {
        payload = await this.jwtService.verifyAsync(resetToken, {
          secret: process.env.JWT_ACCESS_SECRET + "_RESET",
        });
      } catch (jwtError) {
        throw new BadRequestException("Invalid or expired reset token");
      }

      if (payload.type !== userType) {
        throw new BadRequestException("Invalid reset token");
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      switch (userType) {
        case "admin":
          await this.adminService.update(payload.sub, {
            password: hashedPassword,
          });
          break;
        case "teacher":
          await this.teacherService.update(payload.sub, {
            password: hashedPassword,
          });
          break;
        case "student":
          await this.studentService.update(payload.sub, {
            password: hashedPassword,
          });
          break;
        default:
          throw new BadRequestException("Invalid user type");
      }

      return { message: "Password reset successfully" };
    } catch (error) {
      this.logger.error(`Password reset failed`, error);
      throw new InternalServerErrorException("Password reset failed");
    }
  }

  async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto,
    userType: "admin" | "teacher" | "student"
  ): Promise<{ message: string }> {
    try {
      let user: any;
      let service: any;

      switch (userType) {
        case "admin":
          user = await this.adminService.findOne(userId);
          service = this.adminService;
          break;
        case "teacher":
          user = await this.teacherService.findOne(userId);
          service = this.teacherService;
          break;
        case "student":
          user = await this.studentService.findOne(userId);
          service = this.studentService;
          break;
        default:
          throw new BadRequestException("Invalid user type");
      }

      const isCurrentPasswordValid = await bcrypt.compare(
        changePasswordDto.current_password,
        user.password
      );

      if (!isCurrentPasswordValid) {
        throw new BadRequestException("Current password is incorrect");
      }

      const hashedPassword = await bcrypt.hash(
        changePasswordDto.new_password,
        12
      );

      await service.update(userId, { password: hashedPassword });

      return { message: "Password changed successfully" };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException("Password change failed");
    }
  }

  private async updateUserResetToken(
    userType: string,
    userId: number,
    resetToken: string
  ): Promise<void> {
    console.log(`Reset token for ${userType} ${userId}: ${resetToken}`);
  }
}
