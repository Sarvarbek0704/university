import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsDateString,
  Min,
  Max,
  IsBoolean,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class FilterInstallmentDto {
  @ApiPropertyOptional({
    example: 1,
    description: "Filter by contract ID",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  contract_id?: number;

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
    example: "PENDING",
    description: "Filter by status",
    enum: ["PENDING", "PAID", "OVERDUE", "CANCELLED"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["PENDING", "PAID", "OVERDUE", "CANCELLED"])
  status?: string;

  @ApiPropertyOptional({
    example: "2024-09-01",
    description: "Filter by start due date",
  })
  @IsOptional()
  @IsDateString()
  start_due_date?: string;

  @ApiPropertyOptional({
    example: "2024-12-31",
    description: "Filter by end due date",
  })
  @IsOptional()
  @IsDateString()
  end_due_date?: string;

  @ApiPropertyOptional({
    example: true,
    description: "Filter overdue installments",
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  overdue?: boolean;

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
    example: "due_date",
    description: "Sort by field",
    enum: ["due_date", "amount", "status", "created_at", "updatedAt"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["due_date", "amount", "status", "created_at", "updatedAt"])
  sort_by?: string = "due_date";

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
