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

export class CreateStudyFormDto {
  @ApiProperty({
    example: "full_time",
    description: "Name of the study form",
    enum: [
      "full_time",
      "part_time",
      "distance",
      "external",
      "online",
      "blended",
    ],
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum([
    "full_time",
    "part_time",
    "distance",
    "external",
    "online",
    "blended",
  ])
  name: string;

  @ApiProperty({
    example: 4,
    description: "Duration of study in years",
    minimum: 1,
    maximum: 6,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(6)
  duration_years: number;

  @ApiPropertyOptional({
    example: "Full-time study program",
    description: "Description of the study form",
  })
  @IsOptional()
  @IsString()
  description?: string;
}
