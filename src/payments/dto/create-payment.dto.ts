import {
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  Min,
  IsString,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreatePaymentDto {
  @ApiProperty({
    example: 1,
    description: "ID of the student",
  })
  @IsNumber()
  @IsNotEmpty()
  student_id: number;

  @ApiProperty({
    example: 1,
    description: "ID of the payment type",
  })
  @IsNumber()
  @IsNotEmpty()
  payment_type_id: number;

  @ApiProperty({
    example: 500000.0,
    description: "Amount of the payment",
    minimum: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  amount: number;

  @ApiProperty({
    example: "2024-01-15",
    description: "Date of the payment",
  })
  @IsDateString()
  @IsNotEmpty()
  payment_date: string;

  @ApiPropertyOptional({
    example: "CARD_ONLINE",
    description: "Payment method",
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
    description: "Status of the payment",
    enum: ["SUCCESS", "PENDING", "FAILED", "REFUNDED", "CANCELLED", "REVERSED"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["SUCCESS", "PENDING", "FAILED", "REFUNDED", "CANCELLED", "REVERSED"])
  status?: string;

  @ApiPropertyOptional({
    example: "Tuition fee for semester 1",
    description: "Description of the payment",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: "TRX123456789",
    description: "Transaction ID from payment gateway",
  })
  @IsOptional()
  @IsString()
  transaction_id?: string;

  @ApiPropertyOptional({
    example: "REF123456",
    description: "Reference number for the payment",
  })
  @IsOptional()
  @IsString()
  reference_number?: string;
}
