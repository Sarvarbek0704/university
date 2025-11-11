import {
  IsNumber,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
  Min,
  Max,
  IsBoolean,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreatePrerequisiteDto {
  @ApiProperty({
    example: 1,
    description: "ID of the subject that requires prerequisite",
  })
  @IsNumber()
  @IsNotEmpty()
  subject_id: number;

  @ApiProperty({
    example: 2,
    description: "ID of the prerequisite subject",
  })
  @IsNumber()
  @IsNotEmpty()
  prerequisite_subject_id: number;

  @ApiProperty({
    example: "MINIMUM",
    description: "Required grade for the prerequisite",
    enum: ["A", "B", "C", "MINIMUM"],
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(["A", "B", "C", "MINIMUM"])
  required_grade: string;

  @ApiPropertyOptional({
    example: "Must complete Basic Programming before taking this course",
    description: "Additional notes about the prerequisite",
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    example: true,
    description: "Whether the prerequisite is mandatory",
  })
  @IsOptional()
  @IsBoolean()
  is_mandatory?: boolean;

  @ApiPropertyOptional({
    example: 1,
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
    example: 70,
    description: "Minimum score required in prerequisite subject",
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  min_score?: number;
}
