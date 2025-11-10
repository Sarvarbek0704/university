import {
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsString,
  Min,
  Max,
  MaxLength,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class FilterTeacherDto {
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
    example: "John Doe",
    description: "Search by teacher name or email",
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  search?: string;

  @ApiPropertyOptional({
    example: "professor",
    description: "Filter by academic degree",
    enum: ["assistant", "lecturer", "senior_lecturer", "professor"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["assistant", "lecturer", "senior_lecturer", "professor"])
  academic_degree?: string;

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
    enum: ["full_name", "academic_degree", "createdAt", "updatedAt"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["full_name", "academic_degree", "createdAt", "updatedAt"])
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
}
