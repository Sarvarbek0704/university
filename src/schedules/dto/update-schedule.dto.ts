import {
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsString,
  IsBoolean,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateScheduleDto {
  @ApiPropertyOptional({
    example: 1,
    description: "ID of the group",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  group_id?: number;

  @ApiPropertyOptional({
    example: 1,
    description: "ID of the subject",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  subject_id?: number;

  @ApiPropertyOptional({
    example: 1,
    description: "ID of the teacher",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  teacher_id?: number;

  @ApiPropertyOptional({
    example: 1,
    description: "ID of the classroom",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  classroom_id?: number;

  @ApiPropertyOptional({
    example: 2,
    description: "Day of week (1-7, where 1=Monday, 7=Sunday)",
    minimum: 1,
    maximum: 7,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(7)
  day_of_week?: number;

  @ApiPropertyOptional({
    example: "10:00",
    description: "Start time of the lesson",
  })
  @IsOptional()
  @IsString()
  start_time?: string;

  @ApiPropertyOptional({
    example: "11:30",
    description: "End time of the lesson",
  })
  @IsOptional()
  @IsString()
  end_time?: string;

  @ApiPropertyOptional({
    example: "2024-01-16",
    description: "Specific date for the schedule (for one-time events)",
  })
  @IsOptional()
  @IsString()
  specific_date?: string;

  @ApiPropertyOptional({
    example: "Updated lecture notes",
    description: "Additional notes",
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: false,
    description: "Whether the schedule is active",
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
