import {
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsEnum,
  IsString,
  IsDateString,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateExamAttemptDto {
  @ApiPropertyOptional({
    example: 2,
    description: "Attempt number",
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  attempt_number?: number;

  @ApiPropertyOptional({
    example: 85,
    description: "Score obtained in this attempt",
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number;

  @ApiPropertyOptional({
    example: "2024-02-01",
    description: "Date of the attempt",
  })
  @IsOptional()
  @IsDateString()
  attempt_date?: string;

  @ApiPropertyOptional({
    example: "RETAKE_1",
    description: "Status of the attempt",
    enum: [
      "FIRST_ATTEMPT",
      "RETAKE_1",
      "RETAKE_2",
      "FINAL_RETAKE",
      "TRANSFER_GRADE",
      "NOT_ATTENDED",
    ],
  })
  @IsOptional()
  @IsString()
  @IsEnum([
    "FIRST_ATTEMPT",
    "RETAKE_1",
    "RETAKE_2",
    "FINAL_RETAKE",
    "TRANSFER_GRADE",
    "NOT_ATTENDED",
  ])
  status?: string;

  @ApiPropertyOptional({
    example: 30.0,
    description: "Retake fee if applicable",
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  retake_fee?: number;

  @ApiPropertyOptional({
    example: "Improved score in theoretical part",
    description: "Remarks or comments about the attempt",
  })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({
    example: "10:00",
    description: "Start time of the attempt",
  })
  @IsOptional()
  @IsString()
  start_time?: string;

  @ApiPropertyOptional({
    example: "12:30",
    description: "End time of the attempt",
  })
  @IsOptional()
  @IsString()
  end_time?: string;

  @ApiPropertyOptional({
    example: "Updated notes",
    description: "Additional notes",
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
