import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsEnum,
  Min,
  Max,
  IsOptional,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateEducationTypeDto {
  @ApiProperty({
    example: "BACHELOR",
    description: "Name of the education type",
    enum: [
      "BACHELOR",
      "MASTER",
      "DOCTORATE",
      "ASSOCIATE",
      "SPECIALIST",
      "CERTIFICATE",
    ],
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum([
    "BACHELOR",
    "MASTER",
    "DOCTORATE",
    "ASSOCIATE",
    "SPECIALIST",
    "CERTIFICATE",
  ])
  name: string;

  @ApiProperty({
    example: 4,
    description: "Duration of education in years",
    minimum: 1,
    maximum: 6,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(6)
  duration_years: number;

  @ApiPropertyOptional({
    example: "Bachelor's degree program",
    description: "Description of the education type",
  })
  @IsOptional()
  @IsString()
  description?: string;
}
