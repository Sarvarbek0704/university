import {
  IsOptional,
  IsBoolean,
  IsString,
  IsNumber,
  Min,
  Max,
  IsEnum,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class FilterSubjectDto {
  @ApiPropertyOptional({
    example: "Math",
    description: "Search by subject name",
  })
  @IsOptional()
  @IsString()
  search?: string;

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
    example: 1,
    description: "Filter by semester number",
    minimum: 1,
    maximum: 8,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(8)
  @Type(() => Number)
  semester_number?: number;

  @ApiPropertyOptional({
    example: true,
    description: "Filter by active status",
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_active?: boolean;

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
    example: "name",
    description: "Sort by field",
    enum: ["name", "credit", "semester_number", "createdAt", "updatedAt"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["name", "credit", "semester_number", "createdAt", "updatedAt"])
  sort_by?: string = "name";

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
