import {
  IsNumber,
  IsNotEmpty,
  IsEnum,
  IsDateString,
  Min,
  IsOptional,
  IsString,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateScholarshipTransactionDto {
  @ApiProperty({
    example: 1,
    description: "ID of the student",
  })
  @IsNumber()
  @IsNotEmpty()
  student_id: number;

  @ApiProperty({
    example: 1,
    description: "ID of the scholarship",
  })
  @IsNumber()
  @IsNotEmpty()
  scholarship_id: number;

  @ApiProperty({
    example: 500000,
    description: "Payment amount",
    minimum: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  amount: number;

  @ApiProperty({
    example: "2024-01-15",
    description: "Payment date",
  })
  @IsDateString()
  @IsNotEmpty()
  payment_date: string;

  @ApiProperty({
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
  @IsString()
  @IsNotEmpty()
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
  period: string;

  @ApiProperty({
    example: "PAID",
    description: "Payment status",
    enum: ["PAID", "PENDING", "FAILED"],
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(["PAID", "PENDING", "FAILED"])
  status: string;

  @ApiPropertyOptional({
    example: "2024-01-15",
    description: "Transaction creation date",
  })
  @IsOptional()
  @IsDateString()
  created_at?: string;

  @ApiPropertyOptional({
    example: "Monthly scholarship payment",
    description: "Additional remarks",
  })
  @IsOptional()
  @IsString()
  remarks?: string;
}
