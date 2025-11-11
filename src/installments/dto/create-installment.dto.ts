import {
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
  Min,
  IsString,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateInstallmentDto {
  @ApiProperty({
    example: 1,
    description: "ID of the rent contract",
  })
  @IsNumber()
  @IsNotEmpty()
  contract_id: number;

  @ApiProperty({
    example: "2024-09-01",
    description: "Due date for the installment",
  })
  @IsDateString()
  @IsNotEmpty()
  due_date: string;

  @ApiProperty({
    example: 500000.0,
    description: "Amount of the installment",
    minimum: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({
    example: 0,
    description: "Paid amount of the installment",
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  paid_amount?: number;

  @ApiPropertyOptional({
    example: "PENDING",
    description: "Status of the installment",
    enum: ["PENDING", "PAID", "OVERDUE", "CANCELLED"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["PENDING", "PAID", "OVERDUE", "CANCELLED"])
  status?: string;

  @ApiPropertyOptional({
    example: "2024-09-01",
    description: "Payment date when installment was paid",
  })
  @IsOptional()
  @IsDateString()
  payment_date?: string;
}
