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

export class FilterInfoStudentDto {
  @ApiPropertyOptional({
    example: "Ali",
    description: "Search by student name, passport series or JSHSHIR",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 1,
    description: "Filter by faculty ID",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  faculty_id?: number;

  @ApiPropertyOptional({
    example: 1,
    description: "Filter by department ID",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  department_id?: number;

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
    description: "Filter by study form ID",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  study_form_id?: number;

  @ApiPropertyOptional({
    example: 1,
    description: "Filter by education type ID",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  education_type_id?: number;

  @ApiPropertyOptional({
    example: 1,
    description: "Filter by contract type ID",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  contract_type_id?: number;

  @ApiPropertyOptional({
    example: "ACTIVE",
    description: "Filter by status",
    enum: [
      "ACTIVE",
      "ACADEMIC_LEAVE",
      "GRADUATED",
      "EXPELLED",
      "TRANSFERRED",
      "",
    ],
  })
  @IsOptional()
  @IsString()
  @IsEnum([
    "ACTIVE",
    "ACADEMIC_LEAVE",
    "GRADUATED",
    "EXPELLED",
    "TRANSFERRED",
    "",
  ])
  status?: string;

  @ApiPropertyOptional({
    example: 2024,
    description: "Filter by join year",
    minimum: 2000,
    maximum: 2030,
  })
  @IsOptional()
  @IsNumber()
  @Min(2000)
  @Max(2030)
  @Type(() => Number)
  join_year?: number;

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
    example: "createdAt",
    description: "Sort by field",
    enum: ["birth_date", "join_year", "createdAt", "updatedAt"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["birth_date", "join_year", "createdAt", "updatedAt"])
  sort_by?: string = "createdAt";

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
