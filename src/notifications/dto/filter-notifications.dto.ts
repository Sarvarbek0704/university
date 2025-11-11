import {
  IsOptional,
  IsNumber,
  IsString,
  IsEnum,
  IsBoolean,
  IsDateString,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class FilterNotificationsDto {
  @ApiPropertyOptional({ example: 1, description: "Filter by user ID" })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  user_id?: number;

  @ApiPropertyOptional({
    example: "STUDENT",
    description: "Filter by user type",
    enum: ["STUDENT", "TEACHER", "ADMIN", "SYSTEM"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["STUDENT", "TEACHER", "ADMIN", "SYSTEM"])
  user_type?: string;

  @ApiPropertyOptional({
    example: "EXAM",
    description: "Filter by notification type",
    enum: [
      "SYSTEM",
      "ACADEMIC",
      "FINANCIAL",
      "ATTENDANCE",
      "EXAM",
      "LIBRARY",
      "INTERNSHIP",
      "COURSE_WORK",
      "DEADLINE",
      "REMINDER",
      "SECURITY",
      "OTHER",
    ],
  })
  @IsOptional()
  @IsString()
  @IsEnum([
    "SYSTEM",
    "ACADEMIC",
    "FINANCIAL",
    "ATTENDANCE",
    "EXAM",
    "LIBRARY",
    "INTERNSHIP",
    "COURSE_WORK",
    "DEADLINE",
    "REMINDER",
    "SECURITY",
    "OTHER",
  ])
  type?: string;

  @ApiPropertyOptional({
    example: "HIGH",
    description: "Filter by priority",
    enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["LOW", "MEDIUM", "HIGH", "URGENT"])
  priority?: string;

  @ApiPropertyOptional({
    example: "exam_updates",
    description: "Filter by category",
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: true, description: "Filter by read status" })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_read?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: "Filter by archived status",
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_archived?: boolean;

  @ApiPropertyOptional({
    example: "2024-01-01",
    description: "Filter by date from",
  })
  @IsOptional()
  @IsDateString()
  date_from?: string;

  @ApiPropertyOptional({
    example: "2024-01-31",
    description: "Filter by date to",
  })
  @IsOptional()
  @IsDateString()
  date_to?: string;

  @ApiPropertyOptional({ example: 1, description: "Page number" })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: "Items per page" })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({
    example: "sent_at",
    description: "Sort field",
    enum: ["sent_at", "priority", "created_at", "updated_at"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["sent_at", "priority", "created_at", "updated_at"])
  sort_by?: string = "sent_at";

  @ApiPropertyOptional({
    example: "DESC",
    description: "Sort order",
    enum: ["ASC", "DESC"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["ASC", "DESC"])
  sort_order?: string = "DESC";
}
