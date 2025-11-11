import {
  IsNumber,
  IsOptional,
  IsDateString,
  IsNotEmpty,
  Min,
  Max,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class FailedSubjectStatsDto {
  @ApiPropertyOptional({
    example: 1,
    description: "Student ID for individual stats",
  })
  @IsOptional()
  @IsNumber()
  student_id?: number;

  @ApiPropertyOptional({
    example: 1,
    description: "Group ID for group stats",
  })
  @IsOptional()
  @IsNumber()
  group_id?: number;

  @ApiPropertyOptional({
    example: 1,
    description: "Subject ID for subject stats",
  })
  @IsOptional()
  @IsNumber()
  subject_id?: number;

  @ApiPropertyOptional({
    example: 1,
    description: "Faculty ID for faculty stats",
  })
  @IsOptional()
  @IsNumber()
  faculty_id?: number;

  @ApiPropertyOptional({
    example: 1,
    description: "Department ID for department stats",
  })
  @IsOptional()
  @IsNumber()
  department_id?: number;

  @ApiProperty({
    example: "2024-01-01",
    description: "Start date for statistics",
  })
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @ApiProperty({
    example: "2024-01-31",
    description: "End date for statistics",
  })
  @IsDateString()
  @IsNotEmpty()
  end_date: string;

  @ApiPropertyOptional({
    example: 2,
    description: "Academic year for filtering",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  academic_year?: number;

  @ApiPropertyOptional({
    example: 1,
    description: "Semester for filtering",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(2)
  semester?: number;
}
