import {
  IsNumber,
  IsNotEmpty,
  Min,
  Max,
  IsEnum,
  IsOptional,
  IsString,
  IsBoolean,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateExamResultDto {
  @ApiProperty({
    example: 1,
    description: "ID of the exam",
  })
  @IsNumber()
  @IsNotEmpty()
  exam_id: number;

  @ApiProperty({
    example: 1,
    description: "ID of the student",
  })
  @IsNumber()
  @IsNotEmpty()
  student_id: number;

  @ApiProperty({
    example: 85,
    description: "Score obtained by student",
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(100)
  score: number;

  @ApiProperty({
    example: "A",
    description: "Grade based on score",
    enum: ["A", "B", "C", "D", "E", "F", "INCOMPLETE"],
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(["A", "B", "C", "D", "E", "F", "INCOMPLETE"])
  grade: string;

  @ApiPropertyOptional({
    example: "Excellent performance",
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
