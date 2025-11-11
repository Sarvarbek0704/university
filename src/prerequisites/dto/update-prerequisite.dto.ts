import {
  IsNumber,
  IsOptional,
  IsEnum,
  IsString,
  IsBoolean,
  Min,
  Max,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdatePrerequisiteDto {
  @ApiPropertyOptional({
    example: "B",
    description: "Required grade for the prerequisite",
    enum: ["A", "B", "C", "MINIMUM"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["A", "B", "C", "MINIMUM"])
  required_grade?: string;

  @ApiPropertyOptional({
    example: "Updated notes about the prerequisite requirement",
    description: "Additional notes about the prerequisite",
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    example: false,
    description: "Whether the prerequisite is mandatory",
  })
  @IsOptional()
  @IsBoolean()
  is_mandatory?: boolean;

  @ApiPropertyOptional({
    example: 2,
    description: "Minimum semester completion required",
    minimum: 1,
    maximum: 8,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(8)
  min_semester?: number;

  @ApiPropertyOptional({
    example: 75,
    description: "Minimum score required in prerequisite subject",
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  min_score?: number;

  @ApiPropertyOptional({
    example: true,
    description: "Whether the prerequisite is active",
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
