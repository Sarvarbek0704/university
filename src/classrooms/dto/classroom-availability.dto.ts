import {
  IsNumber,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  Min,
  Max,
  IsString,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ClassroomAvailabilityDto {
  @ApiProperty({
    example: "2024-01-15",
    description: "Date to check availability",
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    example: "09:00",
    description: "Start time to check availability",
  })
  @IsString()
  @IsNotEmpty()
  start_time: string;

  @ApiProperty({
    example: "10:30",
    description: "End time to check availability",
  })
  @IsString()
  @IsNotEmpty()
  end_time: string;

  @ApiPropertyOptional({
    example: 1,
    description: "Day of week (1-7, where 1=Monday, 7=Sunday)",
    minimum: 1,
    maximum: 7,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(7)
  day_of_week?: number;
}
