import {
  IsNumber,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsString,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AssignStudentToRoomDto {
  @ApiProperty({
    example: 1,
    description: "ID of the student to assign",
  })
  @IsNumber()
  @IsNotEmpty()
  student_id: number;

  @ApiProperty({
    example: 1,
    description: "ID of the dormitory room",
  })
  @IsNumber()
  @IsNotEmpty()
  dormitory_room_id: number;

  @ApiProperty({
    example: "2024-09-01",
    description: "Start date of accommodation",
  })
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @ApiPropertyOptional({
    example: "2025-06-30",
    description: "End date of accommodation",
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({
    example: "Academic year 2024-2025 accommodation",
    description: "Notes about the assignment",
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
