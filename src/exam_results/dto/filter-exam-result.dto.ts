import {
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  IsEnum,
  IsDateString,
  IsString,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class FilterExamResultDto {
  @ApiPropertyOptional({
    example: 1,
    description: "Filter by exam ID",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  exam_id?: number;

  @ApiPropertyOptional({
    example: 1,
    description: "Filter by student ID",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  student_id?: number;

  @ApiPropertyOptional({
    example: 1,
    description: "Filter by group ID",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  group_id?: number;

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
    example: "A",
    description: "Filter by grade",
    enum: ["A", "B", "C", "D", "E", "F", "INCOMPLETE"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["A", "B", "C", "D", "E", "F", "INCOMPLETE"])
  grade?: string;

  @ApiPropertyOptional({
    example: 75,
    description: "Filter by minimum score",
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  min_score?: number;

  @ApiPropertyOptional({
    example: 100,
    description: "Filter by maximum score",
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  max_score?: number;

  @ApiPropertyOptional({
    example: true,
    description: "Filter by published status",
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_published?: boolean;

  @ApiPropertyOptional({
    example: "2024-01-01",
    description: "Filter by date from",
  })
  @IsOptional()
  @IsDateString()
  date_from?: string;

  @ApiPropertyOptional({
    example: "2024-01-31",
    description: "Filter by date to",
  })
  @IsOptional()
  @IsDateString()
  date_to?: string;

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
    example: "score",
    description: "Sort by field",
    enum: ["score", "grade", "createdAt", "updatedAt"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["score", "grade", "createdAt", "updatedAt"])
  sort_by?: string = "score";

  @ApiPropertyOptional({
    example: "DESC",
    description: "Sort direction",
    enum: ["ASC", "DESC"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["ASC", "DESC"])
  sort_order?: string = "DESC";
}
