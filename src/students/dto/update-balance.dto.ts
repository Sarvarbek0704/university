import { IsNumber, Min, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateBalanceDto {
  @ApiProperty({ example: 500000, description: "Amount to add to balance" })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  amount: number;

  @ApiProperty({
    example: "Tuition fee payment",
    description: "Payment description",
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
