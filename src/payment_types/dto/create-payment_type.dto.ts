import { IsString, IsNotEmpty, IsEnum, IsOptional } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreatePaymentTypeDto {
  @ApiProperty({
    example: "TUITION_FEE",
    description: "Name of the payment type",
    enum: [
      "TUITION_FEE",
      "DORMITORY_FEE",
      "APPLICATION_FEE",
      "LIBRARY_FEE",
      "FINE_LATE",
      "EXAM_FEE",
      "GRADUATION_FEE",
    ],
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum([
    "TUITION_FEE",
    "DORMITORY_FEE",
    "APPLICATION_FEE",
    "LIBRARY_FEE",
    "FINE_LATE",
    "EXAM_FEE",
    "GRADUATION_FEE",
  ])
  name: string;

  @ApiPropertyOptional({
    example: "Tuition fee for academic semester",
    description: "Description of the payment type",
  })
  @IsOptional()
  @IsString()
  description?: string;
}
