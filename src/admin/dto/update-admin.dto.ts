import { PartialType } from "@nestjs/swagger";
import { CreateAdminDto } from "./create-admin.dto";
import {
  IsBoolean,
  IsOptional,
  IsArray,
  IsString,
  IsNumber,
  Min,
  MaxLength,
  ValidateIf,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateAdminDto extends PartialType(CreateAdminDto) {
  @ApiPropertyOptional({
    example: true,
    description: "Approval status of the admin",
  })
  @IsOptional()
  @IsBoolean()
  is_approved?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: "Active status of the admin",
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    example: ["users:create", "users:delete"],
    description: "Updated permissions array",
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @ApiPropertyOptional({
    example: 2,
    description: "Updated department ID",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  department_id?: number;

  @ApiPropertyOptional({
    example: "Senior System Administrator",
    description: "Updated position",
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string;

  @ApiPropertyOptional({
    example: "super_admin",
    description: "Updated admin type",
    enum: ["super_admin", "faculty_admin", "department_admin"],
  })
  @IsOptional()
  @IsString()
  admin_type?: string;

  @ApiPropertyOptional({
    example: "newSecurePassword123",
    description: "New password (minimum 6 characters)",
    minLength: 6,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @ValidateIf((o) => o.password !== undefined)
  password?: string;

  @ApiPropertyOptional({
    example: "+998901234568",
    description: "Updated phone number",
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: "newadmin@university.uz",
    description: "Updated email address",
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    example: "John Smith",
    description: "Updated full name",
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  full_name?: string;
}
