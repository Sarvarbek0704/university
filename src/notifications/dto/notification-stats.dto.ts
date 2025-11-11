import {
  IsOptional,
  IsNumber,
  IsString,
  IsEnum,
  IsDateString,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class NotificationStatsDto {
  @ApiPropertyOptional({
    example: 1,
    description: "User ID for personal stats",
  })
  @IsOptional()
  @IsNumber()
  user_id?: number;

  @ApiPropertyOptional({
    example: "STUDENT",
    description: "User type for filtering",
    enum: ["STUDENT", "TEACHER", "ADMIN", "SYSTEM"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["STUDENT", "TEACHER", "ADMIN", "SYSTEM"])
  user_type?: string;

  @ApiPropertyOptional({
    example: "2024-01-01",
    description: "Start date for statistics",
  })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({
    example: "2024-01-31",
    description: "End date for statistics",
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({
    example: "daily",
    description: "Grouping period",
    enum: ["daily", "weekly", "monthly", "yearly"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["daily", "weekly", "monthly", "yearly"])
  period?: string;
}
