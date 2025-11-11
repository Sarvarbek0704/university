import {
  IsNumber,
  IsNotEmpty,
  IsDateString,
  IsString,
  IsOptional,
  IsEnum,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ExamScheduleDto {
  @ApiPropertyOptional({
    example: 1,
    description: "Group ID for filtering",
  })
  @IsOptional()
  @IsNumber()
  group_id?: number;

  @ApiPropertyOptional({
    example: 1,
    description: "Teacher ID for filtering",
  })
  @IsOptional()
  @IsNumber()
  teacher_id?: number;

  @ApiProperty({
    example: "2024-01-01",
    description: "Start date for schedule",
  })
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @ApiProperty({
    example: "2024-01-31",
    description: "End date for schedule",
  })
  @IsDateString()
  @IsNotEmpty()
  end_date: string;

  @ApiPropertyOptional({
    example: "MIDTERM",
    description: "Exam type for filtering",
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
}
