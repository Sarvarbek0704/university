import {
  IsNumber,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsString,
  IsDateString,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateFailedSubjectDto {
  @ApiProperty({
    example: 1,
    description: "ID of the student",
  })
  @IsNumber()
  @IsNotEmpty()
  student_id: number;

  @ApiProperty({
    example: 1,
    description: "ID of the subject",
  })
  @IsNumber()
  @IsNotEmpty()
  subject_id: number;

  @ApiProperty({
    example: 1,
    description: "ID of the exam attempt",
  })
  @IsNumber()
  @IsNotEmpty()
  exam_attempt_id: number;

  @ApiProperty({
    example: "LOW_SCORE",
    description: "Reason for failure",
    enum: [
      "LOW_SCORE",
      "DID_NOT_ATTEND",
      "PLAGIARISM",
      "ACADEMIC_DEBT",
      "ADMIN_ISSUE",
      "EXCEEDED_ATTEMPTS",
    ],
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum([
    "LOW_SCORE",
    "DID_NOT_ATTEND",
    "PLAGIARISM",
    "ACADEMIC_DEBT",
    "ADMIN_ISSUE",
    "EXCEEDED_ATTEMPTS",
  ])
  fail_reason: string;

  @ApiPropertyOptional({
    example: true,
    description: "Whether retake is required",
  })
  @IsOptional()
  @IsBoolean()
  retake_required?: boolean;

  @ApiPropertyOptional({
    example: 2,
    description: "Semester when retake should be attempted",
  })
  @IsOptional()
  @IsNumber()
  retake_semester?: number;

  @ApiPropertyOptional({
    example: "Failed to achieve minimum passing score",
    description: "Additional notes about the failure",
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: "2024-02-01",
    description: "Planned retake date",
  })
  @IsOptional()
  @IsDateString()
  planned_retake_date?: string;

  @ApiPropertyOptional({
    example: 45,
    description: "Score obtained in the failed attempt",
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  failed_score?: number;
}
