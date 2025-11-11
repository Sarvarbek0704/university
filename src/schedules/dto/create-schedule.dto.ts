import {
  IsNumber,
  IsNotEmpty,
  Min,
  Max,
  IsString,
  IsOptional,
  IsBoolean,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateScheduleDto {
  @ApiProperty({
    example: 1,
    description: "ID of the group",
  })
  @IsNumber()
  @IsNotEmpty()
  group_id: number;

  @ApiProperty({
    example: 1,
    description: "ID of the subject",
  })
  @IsNumber()
  @IsNotEmpty()
  subject_id: number;

  @ApiProperty({
    example: 1,
    description: "ID of the teacher",
  })
  @IsNumber()
  @IsNotEmpty()
  teacher_id: number;

  @ApiProperty({
    example: 1,
    description: "ID of the classroom",
  })
  @IsNumber()
  @IsNotEmpty()
  classroom_id: number;

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
    description: "Specific date for the schedule (for one-time events)",
  })
  @IsOptional()
  @IsString()
  specific_date?: string;

  @ApiPropertyOptional({
    example: "Lecture on Algorithms",
    description: "Additional notes",
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: true,
    description: "Whether the schedule is active",
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
