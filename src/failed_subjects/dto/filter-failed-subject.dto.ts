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

export class FilterFailedSubjectDto {
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
    example: "LOW_SCORE",
    description: "Filter by fail reason",
    enum: [
      "LOW_SCORE",
      "DID_NOT_ATTEND",
      "PLAGIARISM",
      "ACADEMIC_DEBT",
      "ADMIN_ISSUE",
      "EXCEEDED_ATTEMPTS",
    ],
  })
  @IsOptional()
  @IsString()
  @IsEnum([
    "LOW_SCORE",
    "DID_NOT_ATTEND",
    "PLAGIARISM",
    "ACADEMIC_DEBT",
    "ADMIN_ISSUE",
    "EXCEEDED_ATTEMPTS",
  ])
  fail_reason?: string;

  @ApiPropertyOptional({
    example: true,
    description: "Filter by retake required status",
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  retake_required?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: "Filter by resolved status",
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_resolved?: boolean;

  @ApiPropertyOptional({
    example: 2,
    description: "Filter by retake semester",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(8)
  @Type(() => Number)
  retake_semester?: number;

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
    example: "created_at",
    description: "Sort by field",
    enum: ["created_at", "retake_semester", "failed_score", "updated_at"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["created_at", "retake_semester", "failed_score", "updated_at"])
  sort_by?: string = "created_at";

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
