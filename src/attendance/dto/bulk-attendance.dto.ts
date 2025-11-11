import {
  IsNumber,
  IsNotEmpty,
  IsDateString,
  IsArray,
  ValidateNested,
  IsEnum,
  IsOptional,
  IsString,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

class StudentAttendanceDto {
  @ApiProperty({
    example: 1,
    description: "ID of the student",
  })
  @IsNumber()
  @IsNotEmpty()
  student_id: number;

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
    example: "Additional notes",
    description: "Notes for this student",
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: "09:05",
    description: "Actual arrival time",
  })
  @IsOptional()
  @IsString()
  actual_arrival_time?: string;

  @ApiPropertyOptional({
    example: "10:20",
    description: "Actual departure time",
  })
  @IsOptional()
  @IsString()
  actual_departure_time?: string;
}

export class BulkAttendanceDto {
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
    type: [StudentAttendanceDto],
    description: "Array of student attendance records",
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentAttendanceDto)
  students: StudentAttendanceDto[];
}
