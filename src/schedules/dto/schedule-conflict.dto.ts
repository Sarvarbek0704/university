import {
  IsNumber,
  IsNotEmpty,
  IsString,
  IsOptional,
  Min,
  Max,
  IsDateString,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ScheduleConflictDto {
  @ApiProperty({
    example: 1,
    description: "ID of the classroom",
  })
  @IsNumber()
  @IsNotEmpty()
  classroom_id: number;

  @ApiProperty({
    example: 1,
    description: "ID of the teacher",
  })
  @IsNumber()
  @IsNotEmpty()
  teacher_id: number;

  @ApiProperty({
    example: 1,
    description: "ID of the group",
  })
  @IsNumber()
  @IsNotEmpty()
  group_id: number;

  @ApiProperty({
    example: 1,
    description: "Day of week (1-7, where 1=Monday, 7=Sunday)",
    minimum: 1,
    maximum: 7,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(7)
  day_of_week: number;

  @ApiProperty({
    example: "09:00",
    description: "Start time of the lesson",
  })
  @IsString()
  @IsNotEmpty()
  start_time: string;

  @ApiProperty({
    example: "10:30",
    description: "End time of the lesson",
  })
  @IsString()
  @IsNotEmpty()
  end_time: string;

  @ApiPropertyOptional({
    example: "2024-01-15",
    description: "Specific date for the schedule",
  })
  @IsOptional()
  @IsDateString()
  specific_date?: string;

  @ApiPropertyOptional({
    example: 1,
    description: "Schedule ID to exclude from conflict check (for updates)",
  })
  @IsOptional()
  @IsNumber()
  exclude_schedule_id?: number;
}
