import {
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  IsString,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateAttendanceDto {
  @ApiPropertyOptional({
    example: 1,
    description: "ID of the student",
  })
  @IsOptional()
  @IsNumber()
  student_id?: number;

  @ApiPropertyOptional({
    example: 1,
    description: "ID of the schedule",
  })
  @IsOptional()
  @IsNumber()
  schedule_id?: number;

  @ApiPropertyOptional({
    example: "2024-01-15",
    description: "Date of attendance",
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    example: "LATE",
    description: "Attendance status",
    enum: [
      "PRESENT",
      "ABSENT",
      "EXCUSED_ABSENCE",
      "LATE",
      "LEAVE_EARLY",
      "ONLINE_PRESENT",
    ],
  })
  @IsOptional()
  @IsString()
  @IsEnum([
    "PRESENT",
    "ABSENT",
    "EXCUSED_ABSENCE",
    "LATE",
    "LEAVE_EARLY",
    "ONLINE_PRESENT",
  ])
  status?: string;

  @ApiPropertyOptional({
    example: "Updated notes",
    description: "Additional notes",
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: "09:10",
    description: "Actual arrival time (if late)",
  })
  @IsOptional()
  @IsString()
  actual_arrival_time?: string;

  @ApiPropertyOptional({
    example: "10:15",
    description: "Actual departure time (if left early)",
  })
  @IsOptional()
  @IsString()
  actual_departure_time?: string;
}
