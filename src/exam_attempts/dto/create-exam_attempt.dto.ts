import {
  IsNumber,
  IsNotEmpty,
  Min,
  Max,
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateExamAttemptDto {
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
    example: 1,
    description: "Attempt number",
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  attempt_number: number;

  @ApiProperty({
    example: 75,
    description: "Score obtained in this attempt",
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(100)
  score: number;

  @ApiProperty({
    example: "2024-01-15",
    description: "Date of the attempt",
  })
  @IsDateString()
  @IsNotEmpty()
  attempt_date: string;

  @ApiProperty({
    example: "FIRST_ATTEMPT",
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
  @IsString()
  @IsNotEmpty()
  @IsEnum([
    "FIRST_ATTEMPT",
    "RETAKE_1",
    "RETAKE_2",
    "FINAL_RETAKE",
    "TRANSFER_GRADE",
    "NOT_ATTENDED",
  ])
  status: string;

  @ApiPropertyOptional({
    example: 25.5,
    description: "Retake fee if applicable",
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  retake_fee?: number;

  @ApiPropertyOptional({
    example: "Good performance in practical part",
    description: "Remarks or comments about the attempt",
  })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({
    example: "09:00",
    description: "Start time of the attempt",
  })
  @IsOptional()
  @IsString()
  start_time?: string;

  @ApiPropertyOptional({
    example: "11:30",
    description: "End time of the attempt",
  })
  @IsOptional()
  @IsString()
  end_time?: string;

  @ApiPropertyOptional({
    example: "Completed all sections",
    description: "Additional notes",
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
