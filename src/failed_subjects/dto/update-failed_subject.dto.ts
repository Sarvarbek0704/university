import {
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsString,
  IsDateString,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateFailedSubjectDto {
  @ApiPropertyOptional({
    example: "PLAGIARISM",
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
  @IsOptional()
  @IsString()
  @IsEnum([
    "LOW_SCORE",
    "DID_NOT_ATTEND",
    "PLAGIARISM",
    "ACADEMIC_DEBT",
    "ADMIN_ISSUE",
    "EXCEEDED_ATTEMPTS",
  ])
  fail_reason?: string;

  @ApiPropertyOptional({
    example: false,
    description: "Whether retake is required",
  })
  @IsOptional()
  @IsBoolean()
  retake_required?: boolean;

  @ApiPropertyOptional({
    example: 3,
    description: "Semester when retake should be attempted",
  })
  @IsOptional()
  @IsNumber()
  retake_semester?: number;

  @ApiPropertyOptional({
    example: "Updated notes about the failure",
    description: "Additional notes about the failure",
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: "2024-03-01",
    description: "Planned retake date",
  })
  @IsOptional()
  @IsDateString()
  planned_retake_date?: string;

  @ApiPropertyOptional({
    example: 50,
    description: "Score obtained in the failed attempt",
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  failed_score?: number;

  @ApiPropertyOptional({
    example: true,
    description: "Whether the failure has been resolved",
  })
  @IsOptional()
  @IsBoolean()
  is_resolved?: boolean;

  @ApiPropertyOptional({
    example: "Retake completed successfully",
    description: "Resolution notes",
  })
  @IsOptional()
  @IsString()
  resolution_notes?: string;
}
