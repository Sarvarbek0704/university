import {
  IsNumber,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  Min,
  Max,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AttendanceStatsDto {
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
    example: 75,
    description: "Minimum attendance percentage for alerts",
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  alert_threshold?: number;
}
