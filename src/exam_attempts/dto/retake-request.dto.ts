import {
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RetakeRequestDto {
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
    example: "LOW_SCORE",
    description: "Reason for retake request",
    enum: [
      "LOW_SCORE",
      "MEDICAL_REASON",
      "FAMILY_ISSUES",
      "TECHNICAL_ISSUES",
      "OTHER",
    ],
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum([
    "LOW_SCORE",
    "MEDICAL_REASON",
    "FAMILY_ISSUES",
    "TECHNICAL_ISSUES",
    "OTHER",
  ])
  reason: string;

  @ApiPropertyOptional({
    example: "Was sick during the exam",
    description: "Detailed explanation",
  })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiPropertyOptional({
    example: "doctor_note.pdf",
    description: "Attachment file name if any",
  })
  @IsOptional()
  @IsString()
  attachment?: string;
}
