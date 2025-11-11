import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsDateString,
  Min,
  Max,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class FilterPaymentDto {
  @ApiPropertyOptional({
    example: "TRX123",
    description: "Search by transaction ID or reference number",
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
    example: 1,
    description: "Filter by payment type ID",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  payment_type_id?: number;

  @ApiPropertyOptional({
    example: "CARD_ONLINE",
    description: "Filter by payment method",
    enum: [
      "CASH",
      "BANK_TRANSFER",
      "CARD_ONLINE",
      "POS_TERMINAL",
      "INSTALLMENT",
    ],
  })
  @IsOptional()
  @IsString()
  @IsEnum([
    "CASH",
    "BANK_TRANSFER",
    "CARD_ONLINE",
    "POS_TERMINAL",
    "INSTALLMENT",
  ])
  payment_method?: string;

  @ApiPropertyOptional({
    example: "SUCCESS",
    description: "Filter by status",
    enum: ["SUCCESS", "PENDING", "FAILED", "REFUNDED", "CANCELLED", "REVERSED"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["SUCCESS", "PENDING", "FAILED", "REFUNDED", "CANCELLED", "REVERSED"])
  status?: string;

  @ApiPropertyOptional({
    example: "2024-01-01",
    description: "Filter by start date",
  })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({
    example: "2024-01-31",
    description: "Filter by end date",
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

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
    example: 1000000,
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
    enum: ["payment_date", "amount", "createdAt", "updatedAt"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["payment_date", "amount", "createdAt", "updatedAt"])
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
