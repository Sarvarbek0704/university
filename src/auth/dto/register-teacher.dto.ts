import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsNumber,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsDateString,
  IsBoolean,
  MaxLength,
  Min,
  IsEnum,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RegisterTeacherDto {
  @ApiProperty({
    example: "John Smith",
    description: "Full name of the teacher",
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  full_name: string;

  @ApiProperty({
    example: "teacher@university.uz",
    description: "Email address of the teacher",
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  email: string;

  @ApiProperty({
    example: "+998901234567",
    description: "Phone number of the teacher",
  })
  @IsPhoneNumber()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: "password123",
    description: "Password for the teacher account",
    minLength: 6,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @ApiProperty({
    example: "professor",
    description: "Academic degree of the teacher",
    enum: ["assistant", "lecturer", "senior_lecturer", "professor"],
  })
  @IsEnum(["assistant", "lecturer", "senior_lecturer", "professor"])
  @IsNotEmpty()
  academic_degree: string;

  @ApiProperty({
    example: "Senior Lecturer",
    description: "Position of the teacher",
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  position: string;

  @ApiProperty({
    example: 1,
    description: "ID of the department the teacher belongs to",
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  department_id: number;

  @ApiPropertyOptional({
    example: 5000000.0,
    description: "Salary of the teacher",
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salary?: number;

  @ApiPropertyOptional({
    example: "2024-01-15",
    description: "Hire date of the teacher",
  })
  @IsOptional()
  @IsDateString()
  hire_date?: string;

  @ApiPropertyOptional({
    example: "https://example.com/teacher-image.jpg",
    description: "URL of the teacher's profile image",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  image_url?: string;

  @ApiPropertyOptional({
    example: "PhD in Computer Science from MIT",
    description: "Academic background of the teacher",
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  academic_background?: string;

  @ApiPropertyOptional({
    example: "10+ years of teaching experience",
    description: "Teaching experience description",
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  experience?: string;

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
    description: "Teacher approval status",
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  is_approved?: boolean = false;

  @ApiPropertyOptional({
    example: true,
    description: "Active status of the teacher",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;
}
