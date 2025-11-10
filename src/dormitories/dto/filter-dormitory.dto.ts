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

export class FilterDormitoryDto {
  @ApiPropertyOptional({
    example: "Yotoqxona",
    description: "Search by dormitory name or address",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 100,
    description: "Filter by minimum capacity",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  min_capacity?: number;

  @ApiPropertyOptional({
    example: 500,
    description: "Filter by maximum capacity",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  max_capacity?: number;

  @ApiPropertyOptional({
    example: true,
    description: "Filter by active status",
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_active?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: "Filter by availability status",
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_available?: boolean;

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
    enum: ["name", "capacity", "createdAt", "updatedAt"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["name", "capacity", "createdAt", "updatedAt"])
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
