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

export class FilterScheduleDto {
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
    example: 1,
    description: "Filter by teacher ID",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  teacher_id?: number;

  @ApiPropertyOptional({
    example: 1,
    description: "Filter by classroom ID",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  classroom_id?: number;

  @ApiPropertyOptional({
    example: 1,
    description: "Filter by day of week (1-7, where 1=Monday, 7=Sunday)",
    minimum: 1,
    maximum: 7,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(7)
  @Type(() => Number)
  day_of_week?: number;

  @ApiPropertyOptional({
    example: "2024-01-15",
    description: "Filter by date from",
  })
  @IsOptional()
  @IsDateString()
  date_from?: string;

  @ApiPropertyOptional({
    example: "2024-01-20",
    description: "Filter by date to",
  })
  @IsOptional()
  @IsDateString()
  date_to?: string;

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
    example: "day_of_week",
    description: "Sort by field",
    enum: ["day_of_week", "start_time", "createdAt", "updatedAt"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["day_of_week", "start_time", "createdAt", "updatedAt"])
  sort_by?: string = "day_of_week";

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
