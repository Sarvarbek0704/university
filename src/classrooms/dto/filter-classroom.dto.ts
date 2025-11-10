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

export class FilterClassroomDto {
  @ApiPropertyOptional({
    example: "101",
    description: "Search by room number or equipment",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 1,
    description: "Filter by building number",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  @Type(() => Number)
  building_number?: number;

  @ApiPropertyOptional({
    example: "computer_lab",
    description: "Filter by classroom type",
    enum: [
      "lecture_hall",
      "standart_class",
      "seminar_room",
      "computer_lab",
      "science_lab",
      "workshop",
      "conference_room",
    ],
  })
  @IsOptional()
  @IsString()
  @IsEnum([
    "lecture_hall",
    "standart_class",
    "seminar_room",
    "computer_lab",
    "science_lab",
    "workshop",
    "conference_room",
  ])
  type?: string;

  @ApiPropertyOptional({
    example: 20,
    description: "Filter by minimum capacity",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  min_capacity?: number;

  @ApiPropertyOptional({
    example: 50,
    description: "Filter by maximum capacity",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  max_capacity?: number;

  @ApiPropertyOptional({
    example: true,
    description: "Filter by projector availability",
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  has_projector?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: "Filter by computer availability",
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  has_computers?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: "Filter by accessibility",
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_accessible?: boolean;

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
    description: "Filter by available status",
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
    example: "building_number",
    description: "Sort by field",
    enum: [
      "building_number",
      "room_number",
      "capacity",
      "type",
      "createdAt",
      "updatedAt",
    ],
  })
  @IsOptional()
  @IsString()
  @IsEnum([
    "building_number",
    "room_number",
    "capacity",
    "type",
    "createdAt",
    "updatedAt",
  ])
  sort_by?: string = "building_number";

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
