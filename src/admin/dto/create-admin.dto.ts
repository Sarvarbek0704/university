import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsEnum,
  IsOptional,
  IsArray,
  MinLength,
  IsNumber,
  IsBoolean,
  IsNotEmpty,
  MaxLength,
  Min,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateAdminDto {
  @ApiProperty({
    example: "John Doe",
    description: "Full name of the admin",
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  full_name: string;

  @ApiProperty({
    example: "admin@university.uz",
    description: "Email address of the admin",
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: "+998901234567",
    description: "Phone number of the admin",
  })
  @IsPhoneNumber()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: "password123",
    description: "Password for the admin account",
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: "department_admin",
    description: "Type of admin role",
    enum: ["super_admin", "faculty_admin", "department_admin"],
  })
  @IsEnum(["super_admin", "faculty_admin", "department_admin"])
  @IsNotEmpty()
  admin_type: string;

  @ApiPropertyOptional({
    example: 1,
    description: "ID of the department for department admin",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  department_id?: number;

  @ApiPropertyOptional({
    example: "System Administrator",
    description: "Position of the admin",
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string;

  @ApiPropertyOptional({
    example: ["users:create", "users:read"],
    description: "Array of permissions for the admin",
  })
  @IsOptional()
  @IsArray()
  permissions?: string[];

  @ApiPropertyOptional({
    example: "123456",
    description: "Verification OTP for email verification",
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  verification_otp?: string;

  @ApiPropertyOptional({
    description: "OTP expiration timestamp",
  })
  @IsOptional()
  otp_expires_at?: Date;

  @ApiPropertyOptional({
    example: false,
    description: "Email verification status",
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  is_email_verified?: boolean = false;

  @ApiPropertyOptional({
    example: false,
    description: "Admin approval status",
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  is_approved?: boolean = false;

  @ApiPropertyOptional({
    example: true,
    description: "Active status of the admin",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;
}
