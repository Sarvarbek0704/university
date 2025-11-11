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

export class FilterExamAttemptDto {
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
    description: "Filter by attempt number",
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  attempt_number?: number;

  @ApiPropertyOptional({
    example: "FIRST_ATTEMPT",
    description: "Filter by attempt status",
    enum: [
      "FIRST_ATTEMPT",
      "RETAKE_1",
      "RETAKE_2",
      "FINAL_RETAKE",
      "TRANSFER_GRADE",
      "NOT_ATTENDED",
    ],
  })
  @IsOptional()
  @IsString()
  @IsEnum([
    "FIRST_ATTEMPT",
    "RETAKE_1",
    "RETAKE_2",
    "FINAL_RETAKE",
    "TRANSFER_GRADE",
    "NOT_ATTENDED",
  ])
  status?: string;

  @ApiPropertyOptional({
    example: 60,
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
    example: true,
    description: "Filter by paid retake fee status",
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  has_paid_fee?: boolean;

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
    example: "attempt_date",
    description: "Sort by field",
    enum: ["attempt_date", "score", "attempt_number", "createdAt", "updatedAt"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["attempt_date", "score", "attempt_number", "createdAt", "updatedAt"])
  sort_by?: string = "attempt_date";

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
