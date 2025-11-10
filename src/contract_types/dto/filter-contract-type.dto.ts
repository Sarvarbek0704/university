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

export class FilterContractTypeDto {
  @ApiPropertyOptional({
    example: "grant",
    description: "Search by contract type name",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 50,
    description: "Filter by minimum coverage percentage",
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  min_coverage?: number;

  @ApiPropertyOptional({
    example: 100,
    description: "Filter by maximum coverage percentage",
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  max_coverage?: number;

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
    enum: ["name", "coverage_percent", "createdAt", "updatedAt"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["name", "coverage_percent", "createdAt", "updatedAt"])
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
