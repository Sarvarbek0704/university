import {
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsString,
  Min,
  Max,
  IsArray,
  MaxLength,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class FilterAdminDto {
  @ApiPropertyOptional({
    example: "department_admin",
    description: "Filter by admin type",
    enum: ["super_admin", "faculty_admin", "department_admin"],
  })
  @IsOptional()
  @IsEnum(["super_admin", "faculty_admin", "department_admin"])
  admin_type?: string;

  @ApiPropertyOptional({
    example: 1,
    description: "Filter by department ID",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  department_id?: number;

  @ApiPropertyOptional({
    example: true,
    description: "Filter by active status",
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_active?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: "Filter by approval status",
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_approved?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: "Filter by email verification status",
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_email_verified?: boolean;

  @ApiPropertyOptional({
    example: "John Doe",
    description: "Search by admin name or email",
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  search?: string;

  @ApiPropertyOptional({
    example: ["users:create", "users:read"],
    description: "Filter by specific permissions",
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @ApiPropertyOptional({
    example: 1,
    description: "Page number for pagination",
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: "Number of items per page",
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({
    example: "full_name",
    description: "Sort by field",
    enum: ["full_name", "email", "admin_type", "createdAt", "updatedAt"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["full_name", "email", "admin_type", "createdAt", "updatedAt"])
  sort_by?: string = "full_name";

  @ApiPropertyOptional({
    example: "ASC",
    description: "Sort direction",
    enum: ["ASC", "DESC"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["ASC", "DESC"])
  sort_order?: string = "ASC";

  @ApiPropertyOptional({
    example: "2023-01-01",
    description: "Filter by creation date from",
  })
  @IsOptional()
  @IsString()
  created_from?: string;

  @ApiPropertyOptional({
    example: "2023-12-31",
    description: "Filter by creation date to",
  })
  @IsOptional()
  @IsString()
  created_to?: string;
}
