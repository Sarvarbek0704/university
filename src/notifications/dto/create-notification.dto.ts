import {
  IsNumber,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsUrl,
  IsDateString,
  IsObject,
  ValidateIf,
  IsBoolean,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateNotificationDto {
  @ApiProperty({ example: 1, description: "User ID" })
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @ApiProperty({
    example: "STUDENT",
    description: "User type",
    enum: ["STUDENT", "TEACHER", "ADMIN", "SYSTEM"],
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(["STUDENT", "TEACHER", "ADMIN", "SYSTEM"])
  user_type: string;

  @ApiProperty({
    example: "Exam Schedule Update",
    description: "Notification title",
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: "Your exam schedule has been updated for semester 2",
    description: "Notification message",
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    example: "EXAM",
    description: "Notification type",
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
  @IsString()
  @IsNotEmpty()
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
  type: string;

  @ApiPropertyOptional({
    example: "MEDIUM",
    description: "Priority level",
    enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["LOW", "MEDIUM", "HIGH", "URGENT"])
  priority?: string;

  @ApiPropertyOptional({
    example: { exam_id: 1, subject: "Mathematics" },
    description: "Additional metadata",
  })
  @IsOptional()
  @IsObject()
  metadata?: any;

  @ApiPropertyOptional({
    example: "/exams/1",
    description: "Action URL",
  })
  @IsOptional()
  @IsUrl()
  action_url?: string;

  @ApiPropertyOptional({
    example: "exam_updates",
    description: "Notification category",
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    example: "2024-12-31",
    description: "Expiration date",
  })
  @IsOptional()
  @IsDateString()
  expires_at?: string;

  @ApiPropertyOptional({
    example: "exam_schedule_update",
    description: "Template ID",
  })
  @IsOptional()
  @IsString()
  template_id?: string;

  @ApiPropertyOptional({
    example: true,
    description: "Send immediately",
  })
  @IsOptional()
  @IsBoolean()
  send_immediately?: boolean;

  @ApiPropertyOptional({
    example: "2024-02-01T10:00:00Z",
    description: "Schedule send time",
  })
  @ValidateIf((o) => !o.send_immediately)
  @IsOptional()
  @IsDateString()
  scheduled_for?: string;
}
