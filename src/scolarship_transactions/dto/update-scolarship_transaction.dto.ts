import {
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  Min,
  IsString,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateScholarshipTransactionDto {
  @ApiPropertyOptional({
    example: 1,
    description: "ID of the student",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  student_id?: number;

  @ApiPropertyOptional({
    example: 1,
    description: "ID of the scholarship",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  scholarship_id?: number;

  @ApiPropertyOptional({
    example: 500000,
    description: "Payment amount",
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({
    example: "2024-01-15",
    description: "Payment date",
  })
  @IsOptional()
  @IsDateString()
  payment_date?: string;

  @ApiPropertyOptional({
    example: "JANUARY",
    description: "Payment period",
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
    example: "PAID",
    description: "Payment status",
    enum: ["PAID", "PENDING", "FAILED"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["PAID", "PENDING", "FAILED"])
  status?: string;

  @ApiPropertyOptional({
    example: "Monthly scholarship payment",
    description: "Additional remarks",
  })
  @IsOptional()
  @IsString()
  remarks?: string;
}
