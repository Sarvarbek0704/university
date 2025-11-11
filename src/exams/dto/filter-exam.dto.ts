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

export class FilterExamDto {
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
    description: "Filter by group ID",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  group_id?: number;

  @ApiPropertyOptional({
    example: 1,
    description: "Filter by teacher ID",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  teacher_id?: number;

  @ApiPropertyOptional({
    example: "MIDTERM",
    description: "Filter by exam type",
    enum: [
      "MIDTERM",
      "FINAL",
      "QUIZ",
      "RETAKE",
      "ORAL",
      "PRACTICAL",
      "THESIS_DEFENSE",
    ],
  })
  @IsOptional()
  @IsString()
  @IsEnum([
    "MIDTERM",
    "FINAL",
    "QUIZ",
    "RETAKE",
    "ORAL",
    "PRACTICAL",
    "THESIS_DEFENSE",
  ])
  exam_type?: string;

  @ApiPropertyOptional({
    example: "2024-01-15",
    description: "Filter by exam date from",
  })
  @IsOptional()
  @IsDateString()
  exam_date_from?: string;

  @ApiPropertyOptional({
    example: "2024-01-20",
    description: "Filter by exam date to",
  })
  @IsOptional()
  @IsDateString()
  exam_date_to?: string;

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
    example: "exam_date",
    description: "Sort by field",
    enum: ["exam_date", "max_score", "createdAt", "updatedAt"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["exam_date", "max_score", "createdAt", "updatedAt"])
  sort_by?: string = "exam_date";

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
