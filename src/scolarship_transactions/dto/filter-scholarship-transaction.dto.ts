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

export class FilterScholarshipTransactionDto {
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
    description: "Filter by scholarship ID",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  scholarship_id?: number;

  @ApiPropertyOptional({
    example: "PAID",
    description: "Filter by payment status",
    enum: ["PAID", "PENDING", "FAILED"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["PAID", "PENDING", "FAILED"])
  status?: string;

  @ApiPropertyOptional({
    example: "JANUARY",
    description: "Filter by payment period",
    enum: [
      "JANUARY",
      "FEBRUARY",
      "MARCH",
      "APRIL",
      "MAY",
      "JUNE",
      "JULY",
      "AUGUST",
      "SEPTEMBER",
      "OCTOBER",
      "NOVEMBER",
      "DECEMBER",
    ],
  })
  @IsOptional()
  @IsString()
  @IsEnum([
    "JANUARY",
    "FEBRUARY",
    "MARCH",
    "APRIL",
    "MAY",
    "JUNE",
    "JULY",
    "AUGUST",
    "SEPTEMBER",
    "OCTOBER",
    "NOVEMBER",
    "DECEMBER",
  ])
  period?: string;

  @ApiPropertyOptional({
    example: "2024-01-01",
    description: "Filter by payment date from",
  })
  @IsOptional()
  @IsDateString()
  payment_date_from?: string;

  @ApiPropertyOptional({
    example: "2024-12-31",
    description: "Filter by payment date to",
  })
  @IsOptional()
  @IsDateString()
  payment_date_to?: string;

  @ApiPropertyOptional({
    example: 100000,
    description: "Filter by minimum amount",
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  min_amount?: number;

  @ApiPropertyOptional({
    example: 500000,
    description: "Filter by maximum amount",
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  max_amount?: number;

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
    example: "payment_date",
    description: "Sort by field",
    enum: ["payment_date", "amount", "created_at", "period", "status"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["payment_date", "amount", "created_at", "period", "status"])
  sort_by?: string = "payment_date";

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
