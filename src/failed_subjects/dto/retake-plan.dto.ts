import {
  IsNumber,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

class RetakeItemDto {
  @ApiProperty({
    example: 1,
    description: "ID of the failed subject",
  })
  @IsNumber()
  @IsNotEmpty()
  failed_subject_id: number;

  @ApiProperty({
    example: "2024-02-15",
    description: "Planned retake date",
  })
  @IsDateString()
  @IsNotEmpty()
  planned_date: string;

  @ApiPropertyOptional({
    example: "Morning session",
    description: "Additional notes for this retake",
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RetakePlanDto {
  @ApiProperty({
    example: 1,
    description: "Student ID",
  })
  @IsNumber()
  @IsNotEmpty()
  student_id: number;

  @ApiProperty({
    example: 2,
    description: "Semester for retake",
  })
  @IsNumber()
  @IsNotEmpty()
  semester: number;

  @ApiProperty({
    example: "2024",
    description: "Academic year for retake",
  })
  @IsString()
  @IsNotEmpty()
  academic_year: string;

  @ApiProperty({
    type: [RetakeItemDto],
    description: "List of subjects to retake",
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RetakeItemDto)
  retake_items: RetakeItemDto[];
}
