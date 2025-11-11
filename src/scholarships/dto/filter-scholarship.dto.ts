import {
  IsOptional,
  IsBoolean,
  IsString,
  IsNumber,
  Min,
  Max,
  IsEnum,
  IsDateString,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class FilterScholarshipDto {
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
    example: "STATE_STANDARD",
    description: "Filter by scholarship type",
    enum: [
      "STATE_STANDARD",
      "PRESIDENTIAL",
      "NAMED_SCHOLARSHIP",
      "SOCIAL_SUPPORT",
      "PRIVATE_FUNDED",
      "RESEARCH_GRANT",
    ],
  })
  @IsOptional()
  @IsString()
  @IsEnum([
    "STATE_STANDARD",
    "PRESIDENTIAL",
    "NAMED_SCHOLARSHIP",
    "SOCIAL_SUPPORT",
    "PRIVATE_FUNDED",
    "RESEARCH_GRANT",
  ])
  scholarship_type?: string;

  @ApiPropertyOptional({
    example: 500000,
    description: "Filter by minimum amount",
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  min_amount?: number;

  @ApiPropertyOptional({
    example: 1000000,
    description: "Filter by maximum amount",
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  max_amount?: number;

  @ApiPropertyOptional({
    example: "2024-01-01",
    description: "Filter by month from",
  })
  @IsOptional()
  @IsDateString()
  month_from?: string;

  @ApiPropertyOptional({
    example: "2024-12-31",
    description: "Filter by month to",
  })
  @IsOptional()
  @IsDateString()
  month_to?: string;

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
    example: "month",
    description: "Sort by field",
    enum: ["month", "amount", "createdAt", "updatedAt"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["month", "amount", "createdAt", "updatedAt"])
  sort_by?: string = "month";

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
