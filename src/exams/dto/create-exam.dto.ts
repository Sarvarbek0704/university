import {
  IsNumber,
  IsNotEmpty,
  IsEnum,
  IsDateString,
  IsOptional,
  IsString,
  Min,
  Max,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateExamDto {
  @ApiProperty({
    example: 1,
    description: "ID of the subject",
  })
  @IsNumber()
  @IsNotEmpty()
  subject_id: number;

  @ApiProperty({
    example: 1,
    description: "ID of the group",
  })
  @IsNumber()
  @IsNotEmpty()
  group_id: number;

  @ApiProperty({
    example: 1,
    description: "ID of the teacher",
  })
  @IsNumber()
  @IsNotEmpty()
  teacher_id: number;

  @ApiProperty({
    example: "2024-01-15",
    description: "Date of the exam",
  })
  @IsDateString()
  @IsNotEmpty()
  exam_date: string;

  @ApiProperty({
    example: "MIDTERM",
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
  @IsString()
  @IsNotEmpty()
  @IsEnum([
    "MIDTERM",
    "FINAL",
    "QUIZ",
    "RETAKE",
    "ORAL",
    "PRACTICAL",
    "THESIS_DEFENSE",
  ])
  exam_type: string;

  @ApiProperty({
    example: 50,
    description: "Maximum score for the exam",
    minimum: 1,
    maximum: 100,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(100)
  max_score: number;

  @ApiPropertyOptional({
    example: "Room 101, Building A",
    description: "Location of the exam",
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    example: "Bring calculator and ID card",
    description: "Additional instructions",
  })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiPropertyOptional({
    example: "09:00",
    description: "Start time of the exam",
  })
  @IsOptional()
  @IsString()
  start_time?: string;

  @ApiPropertyOptional({
    example: "11:00",
    description: "End time of the exam",
  })
  @IsOptional()
  @IsString()
  end_time?: string;

  @ApiPropertyOptional({
    example: 2,
    description: "Duration of exam in hours",
  })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  duration_hours?: number;
}
