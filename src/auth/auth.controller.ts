import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Res,
  Get,
  Query,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterAdminDto } from "./dto/register-admin.dto";
import { VerifyAdminDto } from "./dto/verify-admin.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { SuperAdminGuard } from "./guards/super-admin.guard";
import { TeacherGuard } from "./guards/teacher.guard";
import { AdminGuard } from "./guards/admin.guard";
import { RegisterTeacherDto } from "./dto/register-teacher.dto";
import { StudentGuard } from "./guards/student.guard";
import { RegisterStudentDto } from "./dto/register-student.dto";
import { AdminService } from "../admin/admin.service";
import { TeacherService } from "../teachers/teachers.service";
import { StudentService } from "../students/students.service";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { ResetPasswordRequestDto } from "./dto/reset-password-request.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly adminService: AdminService,
    private readonly teacherService: TeacherService,
    private readonly studentService: StudentService
  ) {}

  @Post("register/admin")
  @ApiOperation({ summary: "Register new admin (requires approval)" })
  @ApiResponse({ status: 201, description: "Admin registered successfully" })
  @ApiResponse({ status: 409, description: "Admin already exists" })
  @ApiResponse({ status: 500, description: "Registration failed" })
  async registerAdmin(@Body() registerAdminDto: RegisterAdminDto) {
    return this.authService.registerAdmin(registerAdminDto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login admin" })
  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  @ApiResponse({ status: 403, description: "Admin not approved or inactive" })
  @ApiResponse({ status: 500, description: "Login failed" })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: any
  ) {
    return this.authService.login(loginDto, "admin", response);
  }

  @Post("verify-admin")
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Verify admin (super admin only)" })
  @ApiResponse({ status: 200, description: "Admin verified successfully" })
  @ApiResponse({ status: 403, description: "Super admin access required" })
  @ApiResponse({ status: 404, description: "Admin not found" })
  @ApiResponse({ status: 500, description: "Verification failed" })
  async verifyAdmin(@Body() verifyAdminDto: VerifyAdminDto, @Req() req: any) {
    return this.authService.verifyAdmin(verifyAdminDto, req.user);
  }

  @Post("logout")
  @ApiOperation({ summary: "Logout admin" })
  @ApiResponse({ status: 200, description: "Logout successful" })
  @ApiResponse({ status: 500, description: "Logout failed" })
  async logout(@Res({ passthrough: true }) response: any) {
    return this.authService.logout(response, "admin");
  }

  @Post("refresh")
  @ApiOperation({ summary: "Refresh admin tokens" })
  @ApiResponse({ status: 200, description: "Tokens refreshed successfully" })
  @ApiResponse({ status: 401, description: "Refresh token not found" })
  @ApiResponse({ status: 403, description: "Admin not authorized" })
  @ApiResponse({ status: 500, description: "Token refresh failed" })
  async refreshTokens(
    @Req() request: any,
    @Res({ passthrough: true }) response: any
  ) {
    return this.authService.refreshAdminTokens(null, response);
  }

  @Post("register/teacher")
  @ApiOperation({ summary: "Register new teacher (requires admin approval)" })
  @ApiResponse({ status: 201, description: "Teacher registered successfully" })
  @ApiResponse({ status: 409, description: "Teacher already exists" })
  @ApiResponse({ status: 500, description: "Registration failed" })
  async registerTeacher(@Body() registerTeacherDto: RegisterTeacherDto) {
    return this.authService.registerTeacher(registerTeacherDto);
  }

  @Post("login/teacher")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login teacher" })
  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  @ApiResponse({ status: 403, description: "Teacher not approved or inactive" })
  @ApiResponse({ status: 500, description: "Login failed" })
  async teacherLogin(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: any
  ) {
    return this.authService.teacherLogin(loginDto, response);
  }

  @Post("refresh/teacher")
  @ApiOperation({ summary: "Refresh teacher tokens" })
  @ApiResponse({ status: 200, description: "Tokens refreshed successfully" })
  @ApiResponse({ status: 401, description: "Refresh token not found" })
  @ApiResponse({ status: 403, description: "Teacher not authorized" })
  @ApiResponse({ status: 500, description: "Token refresh failed" })
  async refreshTeacherTokens(
    @Req() request: any,
    @Res({ passthrough: true }) response: any
  ) {
    return this.authService.refreshTeacherTokens(null, response);
  }

  @Post("logout/teacher")
  @ApiOperation({ summary: "Logout teacher" })
  @ApiResponse({ status: 200, description: "Logout successful" })
  @ApiResponse({ status: 500, description: "Logout failed" })
  async teacherLogout(@Res({ passthrough: true }) response: any) {
    return this.authService.teacherLogout(response);
  }

  @Post("verify-teacher")
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Verify teacher (super admin only)" })
  @ApiResponse({ status: 200, description: "Teacher verified successfully" })
  @ApiResponse({ status: 403, description: "Super admin access required" })
  @ApiResponse({ status: 404, description: "Teacher not found" })
  @ApiResponse({ status: 500, description: "Verification failed" })
  async verifyTeacher(
    @Body() verifyTeacherDto: { teacher_id: number; is_approved: boolean },
    @Req() req: any
  ) {
    return this.authService.verifyTeacher(
      verifyTeacherDto.teacher_id,
      verifyTeacherDto.is_approved,
      req.user
    );
  }

  @Post("register/student")
  @ApiOperation({ summary: "Register new student (requires admin approval)" })
  @ApiResponse({ status: 201, description: "Student registered successfully" })
  @ApiResponse({ status: 409, description: "Student already exists" })
  @ApiResponse({ status: 500, description: "Registration failed" })
  async registerStudent(@Body() registerStudentDto: RegisterStudentDto) {
    return this.authService.registerStudent(registerStudentDto);
  }

  @Post("login/student")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login student" })
  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  @ApiResponse({ status: 403, description: "Student not approved or inactive" })
  @ApiResponse({ status: 500, description: "Login failed" })
  async studentLogin(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: any
  ) {
    return this.authService.studentLogin(loginDto, response);
  }

  @Post("refresh/student")
  @ApiOperation({ summary: "Refresh student tokens" })
  @ApiResponse({ status: 200, description: "Tokens refreshed successfully" })
  @ApiResponse({ status: 401, description: "Refresh token not found" })
  @ApiResponse({ status: 403, description: "Student not authorized" })
  @ApiResponse({ status: 500, description: "Token refresh failed" })
  async refreshStudentTokens(
    @Req() request: any,
    @Res({ passthrough: true }) response: any
  ) {
    return this.authService.refreshStudentTokens(null, response);
  }

  @Post("logout/student")
  @ApiOperation({ summary: "Logout student" })
  @ApiResponse({ status: 200, description: "Logout successful" })
  @ApiResponse({ status: 500, description: "Logout failed" })
  async studentLogout(@Res({ passthrough: true }) response: any) {
    return this.authService.studentLogout(response);
  }

  @Post("verify-student")
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Verify student (super admin only)" })
  @ApiResponse({ status: 200, description: "Student verified successfully" })
  @ApiResponse({ status: 403, description: "Super admin access required" })
  @ApiResponse({ status: 404, description: "Student not found" })
  @ApiResponse({ status: 500, description: "Verification failed" })
  async verifyStudent(
    @Body() verifyStudentDto: { student_id: number; is_approved: boolean },
    @Req() req: any
  ) {
    return this.authService.verifyStudent(
      verifyStudentDto.student_id,
      verifyStudentDto.is_approved,
      req.user
    );
  }

  @Post("verify-email")
  @ApiOperation({ summary: "Verify email with OTP" })
  @ApiQuery({ name: "userType", enum: ["admin", "teacher", "student"] })
  @ApiResponse({ status: 200, description: "Email verified successfully" })
  @ApiResponse({ status: 400, description: "Invalid OTP or user type" })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 500, description: "Email verification failed" })
  async verifyEmail(
    @Query("userType") userType: "admin" | "teacher" | "student",
    @Body() verifyDto: { email: string; otp: string }
  ) {
    return this.authService.verifyEmail(
      verifyDto.email,
      verifyDto.otp,
      userType
    );
  }

  @Post("resend-otp")
  @ApiOperation({ summary: "Resend OTP for email verification" })
  @ApiQuery({ name: "userType", enum: ["admin", "teacher", "student"] })
  @ApiResponse({ status: 200, description: "OTP sent successfully" })
  @ApiResponse({ status: 400, description: "Email already verified" })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 500, description: "Failed to resend OTP" })
  async resendOTP(
    @Query("userType") userType: "admin" | "teacher" | "student",
    @Body() resendDto: { email: string }
  ) {
    return this.authService.resendOTP(resendDto.email, userType);
  }

  @Get("profile/admin")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get admin profile" })
  @ApiResponse({ status: 200, description: "Profile retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getAdminProfile(@Req() req: any) {
    const admin = await this.adminService.findOne(req.user.id);
    const department = admin.department_id
      ? await this.adminService.getAdminDepartment(admin.id)
      : null;

    return {
      id: admin.id,
      full_name: admin.full_name,
      email: admin.email,
      phone: admin.phone,
      admin_type: admin.admin_type,
      position: admin.position,
      department: department
        ? {
            id: department.id,
            name: department.name,
            code: department.code,
          }
        : null,
      is_approved: admin.is_approved,
      is_active: admin.is_active,
      is_email_verified: admin.is_email_verified,
      permissions: admin.permissions || [],
      created_at: admin.createdAt,
      updated_at: admin.updatedAt,
    };
  }

  @Get("profile/teacher")
  @UseGuards(JwtAuthGuard, TeacherGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get teacher profile" })
  @ApiResponse({ status: 200, description: "Profile retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getTeacherProfile(@Req() req: any) {
    const teacher = await this.teacherService.findOne(req.user.id);
    const department = await this.teacherService.getTeacherDepartment(
      teacher.id
    );

    return {
      id: teacher.id,
      full_name: teacher.full_name,
      email: teacher.email,
      phone: teacher.phone,
      academic_degree: teacher.academic_degree,
      position: teacher.position,
      department: {
        id: department.id,
        name: department.name,
        code: department.code,
      },
      salary: teacher.salary,
      hire_date: teacher.hire_date,
      is_approved: teacher.is_approved,
      is_active: teacher.is_active,
      is_email_verified: teacher.is_email_verified,
      created_at: teacher.createdAt,
      updated_at: teacher.updatedAt,
    };
  }

  @Get("profile/student")
  @UseGuards(JwtAuthGuard, StudentGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get student profile" })
  @ApiResponse({ status: 200, description: "Profile retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getStudentProfile(@Req() req: any) {
    const student = await this.studentService.findOne(req.user.id);
    const department = student.department_id
      ? await this.studentService.getStudentDepartment(student.id)
      : null;

    return {
      id: student.id,
      full_name: student.full_name,
      email: student.email,
      phone: student.phone,
      address: student.address,
      student_id: student.student_id,
      department: department
        ? {
            id: department.id,
            name: department.name,
            code: department.code,
          }
        : null,
      enrollment_date: student.enrollment_date,
      balance: student.balance,
      is_approved: student.is_approved,
      is_active: student.is_active,
      is_email_verified: student.is_email_verified,
      created_at: student.createdAt,
      updated_at: student.updatedAt,
    };
  }

  @Post("request-password-reset")
  @ApiOperation({ summary: "Request password reset" })
  @ApiQuery({ name: "userType", enum: ["admin", "teacher", "student"] })
  @ApiResponse({
    status: 200,
    description: "Reset email sent if account exists",
  })
  @ApiResponse({ status: 500, description: "Failed to process reset request" })
  async requestPasswordReset(
    @Query("userType") userType: "admin" | "teacher" | "student",
    @Body() resetRequestDto: ResetPasswordRequestDto
  ) {
    return this.authService.requestPasswordReset(
      resetRequestDto.email,
      userType
    );
  }

  @Post("reset-password")
  @ApiOperation({ summary: "Reset password with token" })
  @ApiQuery({ name: "userType", enum: ["admin", "teacher", "student"] })
  @ApiResponse({ status: 200, description: "Password reset successfully" })
  @ApiResponse({ status: 400, description: "Invalid or expired token" })
  @ApiResponse({ status: 500, description: "Password reset failed" })
  async resetPassword(
    @Query("userType") userType: "admin" | "teacher" | "student",
    @Body() resetPasswordDto: ResetPasswordDto
  ) {
    return this.authService.resetPassword(
      resetPasswordDto.reset_token,
      resetPasswordDto.new_password,
      userType
    );
  }

  @Post("change-password")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Change password" })
  @ApiQuery({ name: "userType", enum: ["admin", "teacher", "student"] })
  @ApiResponse({ status: 200, description: "Password changed successfully" })
  @ApiResponse({ status: 400, description: "Current password is incorrect" })
  @ApiResponse({ status: 500, description: "Password change failed" })
  async changePassword(
    @Query("userType") userType: "admin" | "teacher" | "student",
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: any
  ) {
    return this.authService.changePassword(
      req.user.id,
      changePasswordDto,
      userType
    );
  }
}
