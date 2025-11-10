import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsEnum,
  IsOptional,
  IsArray,
  MinLength,
  IsNotEmpty,
  MaxLength,
  IsNumber,
  Min,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RegisterAdminDto {
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
  @MaxLength(100)
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
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(100)
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
  @IsString({ each: true })
  permissions?: string[];
}
