import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
  MinLength,
  MaxLength,
  IsDateString,
  Min,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateTeacherDto {
  @ApiPropertyOptional({
    example: "John Doe",
    description: "Full name of the teacher",
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  full_name?: string;

  @ApiPropertyOptional({
    example: "+998901234567",
    description: "Phone number of the teacher",
  })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiPropertyOptional({
    example: "john.doe@university.uz",
    description: "Email address of the teacher",
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: "newPassword123",
    description: "New password for the teacher",
    minLength: 6,
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({
    example: "professor",
    description: "Academic degree of the teacher",
    enum: ["assistant", "lecturer", "senior_lecturer", "professor"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["assistant", "lecturer", "senior_lecturer", "professor"])
  academic_degree?: string;

  @ApiPropertyOptional({
    example: "Head of Computer Science Department",
    description: "Position of the teacher",
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string;

  @ApiPropertyOptional({
    example: 1,
    description: "ID of the department the teacher belongs to",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  department_id?: number;

  @ApiPropertyOptional({
    example: 5000000.0,
    description: "Salary of the teacher",
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salary?: number;

  @ApiPropertyOptional({
    example: "2023-01-15",
    description: "Hire date of the teacher",
  })
  @IsOptional()
  @IsDateString()
  hire_date?: string;

  @ApiPropertyOptional({
    example: true,
    description: "Active status of the teacher",
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: "Approval status of the teacher",
  })
  @IsOptional()
  @IsBoolean()
  is_approved?: boolean;
}
