import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  Min,
  Max,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateContractTypeDto {
  @ApiProperty({
    example: "STATE_GRANT",
    description: "Name of the contract type",
    enum: ["STATE_GRANT", "FEE_PAYING", "PARTIAL_GRANT"],
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(["STATE_GRANT", "FEE_PAYING", "PARTIAL_GRANT"])
  name: string;

  @ApiPropertyOptional({
    example: 100,
    description: "Coverage percentage for grants",
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  coverage_percent?: number;

  @ApiPropertyOptional({
    example: "Full state grant coverage",
    description: "Description of the contract type",
  })
  @IsOptional()
  @IsString()
  description?: string;
}
