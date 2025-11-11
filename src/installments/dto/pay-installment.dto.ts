import {
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  Min,
  IsString,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class PayInstallmentDto {
  @ApiProperty({
    example: 500000.0,
    description: "Amount being paid",
    minimum: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  paid_amount: number;

  @ApiPropertyOptional({
    example: "2024-09-01",
    description: "Payment date",
  })
  @IsOptional()
  @IsDateString()
  payment_date?: string;

  @ApiPropertyOptional({
    example: "Bank transfer ref: TRX123456",
    description: "Payment notes",
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
