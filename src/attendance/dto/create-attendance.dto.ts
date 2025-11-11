import {
  IsNumber,
  IsNotEmpty,
  IsEnum,
  IsDateString,
  IsOptional,
  IsString,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateAttendanceDto {
  @ApiProperty({
    example: 1,
    description: "ID of the student",
  })
  @IsNumber()
  @IsNotEmpty()
  student_id: number;

  @ApiProperty({
    example: 1,
    description: "ID of the schedule",
  })
  @IsNumber()
  @IsNotEmpty()
  schedule_id: number;

  @ApiProperty({
    example: "2024-01-15",
    description: "Date of attendance",
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    example: "PRESENT",
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
  @IsString()
  @IsNotEmpty()
  @IsEnum([
    "PRESENT",
    "ABSENT",
    "EXCUSED_ABSENCE",
    "LATE",
    "LEAVE_EARLY",
    "ONLINE_PRESENT",
  ])
  status: string;

  @ApiPropertyOptional({
    example: "Came late due to traffic",
    description: "Additional notes",
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: "09:05",
    description: "Actual arrival time (if late)",
  })
  @IsOptional()
  @IsString()
  actual_arrival_time?: string;

  @ApiPropertyOptional({
    example: "10:20",
    description: "Actual departure time (if left early)",
  })
  @IsOptional()
  @IsString()
  actual_departure_time?: string;
}
