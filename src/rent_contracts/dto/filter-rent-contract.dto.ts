import {
  IsOptional,
  IsBoolean,
  IsString,
  IsNumber,
  IsEnum,
  IsDateString,
  Min,
  Max,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class FilterRentContractDto {
  @ApiPropertyOptional({
    example: "Yunusobod",
    description: "Search by address or landlord name",
  })
  @IsOptional()
  @IsString()
  search?: string;

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
    example: "ACTIVE",
    description: "Filter by status",
    enum: ["ACTIVE", "EXPIRED", "TERMINATED", "PENDING"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["ACTIVE", "EXPIRED", "TERMINATED", "PENDING"])
  status?: string;

  @ApiPropertyOptional({
    example: "2024-09-01",
    description: "Filter by start date",
  })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({
    example: "2025-06-30",
    description: "Filter by end date",
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({
    example: 1000000,
    description: "Filter by minimum monthly rent",
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  min_rent?: number;

  @ApiPropertyOptional({
    example: 2000000,
    description: "Filter by maximum monthly rent",
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  max_rent?: number;

  @ApiPropertyOptional({
    example: 20,
    description: "Filter by minimum university support percentage",
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  min_support?: number;

  @ApiPropertyOptional({
    example: 50,
    description: "Filter by maximum university support percentage",
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  max_support?: number;

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
    example: "start_date",
    description: "Sort by field",
    enum: ["start_date", "end_date", "monthly_rent", "createdAt", "updatedAt"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["start_date", "end_date", "monthly_rent", "createdAt", "updatedAt"])
  sort_by?: string = "start_date";

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
