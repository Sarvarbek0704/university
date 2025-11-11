import {
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  IsString,
  Min,
  Max,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateExamDto {
  @ApiPropertyOptional({
    example: 1,
    description: "ID of the subject",
  })
  @IsOptional()
  @IsNumber()
  subject_id?: number;

  @ApiPropertyOptional({
    example: 1,
    description: "ID of the group",
  })
  @IsOptional()
  @IsNumber()
  group_id?: number;

  @ApiPropertyOptional({
    example: 1,
    description: "ID of the teacher",
  })
  @IsOptional()
  @IsNumber()
  teacher_id?: number;

  @ApiPropertyOptional({
    example: "2024-01-20",
    description: "Date of the exam",
  })
  @IsOptional()
  @IsDateString()
  exam_date?: string;

  @ApiPropertyOptional({
    example: "FINAL",
    description: "Type of exam",
    enum: [
      "MIDTERM",
      "FINAL",
      "QUIZ",
      "RETAKE",
      "ORAL",
      "PRACTICAL",
      "THESIS_DEFENSE",
    ],
  })
  @IsOptional()
  @IsString()
  @IsEnum([
    "MIDTERM",
    "FINAL",
    "QUIZ",
    "RETAKE",
    "ORAL",
    "PRACTICAL",
    "THESIS_DEFENSE",
  ])
  exam_type?: string;

  @ApiPropertyOptional({
    example: 60,
    description: "Maximum score for the exam",
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  max_score?: number;

  @ApiPropertyOptional({
    example: "Room 201, Building B",
    description: "Location of the exam",
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    example: "Updated instructions",
    description: "Additional instructions",
  })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiPropertyOptional({
    example: "10:00",
    description: "Start time of the exam",
  })
  @IsOptional()
  @IsString()
  start_time?: string;

  @ApiPropertyOptional({
    example: "12:00",
    description: "End time of the exam",
  })
  @IsOptional()
  @IsString()
  end_time?: string;

  @ApiPropertyOptional({
    example: 3,
    description: "Duration of exam in hours",
  })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  duration_hours?: number;
}
