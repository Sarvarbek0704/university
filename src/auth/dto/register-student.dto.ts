import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsNumber,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsBoolean,
  MaxLength,
  Min,
  IsDateString,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RegisterStudentDto {
  @ApiProperty({
    example: "John Doe",
    description: "Full name of the student",
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  full_name: string;

  @ApiProperty({
    example: "student@university.uz",
    description: "Email address of the student",
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  email: string;

  @ApiProperty({
    example: "+998901234567",
    description: "Phone number of the student",
  })
  @IsPhoneNumber()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: "password123",
    description: "Password for the student account",
    minLength: 6,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @ApiProperty({
    example: "Tashkent, Street 1",
    description: "Address of the student",
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address: string;

  @ApiPropertyOptional({
    example: 1,
    description: "ID of the department the student belongs to",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  department_id?: number;

  @ApiPropertyOptional({
    example: "2023-09-01",
    description: "Enrollment date of the student",
  })
  @IsOptional()
  @IsDateString()
  enrollment_date?: string;

  @ApiPropertyOptional({
    example: "AB1234567",
    description: "Student ID number",
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  student_id?: string;

  @ApiPropertyOptional({
    example: "https://example.com/student-image.jpg",
    description: "URL of the student's profile image",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  image_url?: string;

  @ApiPropertyOptional({
    example: 0.0,
    description: "Initial balance of the student",
    default: 0.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  balance?: number = 0.0;

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
    description: "Student approval status",
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  is_approved?: boolean = false;

  @ApiPropertyOptional({
    example: true,
    description: "Active status of the student",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;
}
