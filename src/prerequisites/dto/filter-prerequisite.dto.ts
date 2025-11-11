import {
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  IsEnum,
  IsString,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class FilterPrerequisiteDto {
  @ApiPropertyOptional({
    example: 1,
    description: "Filter by subject ID",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  subject_id?: number;

  @ApiPropertyOptional({
    example: 1,
    description: "Filter by prerequisite subject ID",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  prerequisite_subject_id?: number;

  @ApiPropertyOptional({
    example: "MINIMUM",
    description: "Filter by required grade",
    enum: ["A", "B", "C", "MINIMUM"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["A", "B", "C", "MINIMUM"])
  required_grade?: string;

  @ApiPropertyOptional({
    example: true,
    description: "Filter by mandatory status",
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_mandatory?: boolean;

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
    example: "created_at",
    description: "Sort by field",
    enum: ["created_at", "required_grade", "min_score", "updated_at"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["created_at", "required_grade", "min_score", "updated_at"])
  sort_by?: string = "created_at";

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
