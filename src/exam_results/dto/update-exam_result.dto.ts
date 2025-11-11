import {
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsEnum,
  IsString,
  IsBoolean,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateExamResultDto {
  @ApiPropertyOptional({
    example: 90,
    description: "Score obtained by student",
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number;

  @ApiPropertyOptional({
    example: "A",
    description: "Grade based on score",
    enum: ["A", "B", "C", "D", "E", "F", "INCOMPLETE"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["A", "B", "C", "D", "E", "F", "INCOMPLETE"])
  grade?: string;

  @ApiPropertyOptional({
    example: "Updated notes",
    description: "Additional notes or comments",
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: true,
    description: "Whether the result is published",
  })
  @IsOptional()
  @IsBoolean()
  is_published?: boolean;
}
