import {
  IsArray,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  ValidateNested,
  IsObject,
  IsNumber,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { CreateNotificationDto } from "./create-notification.dto";

export class UserRecipientDto {
  @ApiProperty({ example: 1, description: "User ID" })
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @ApiProperty({ example: "STUDENT", description: "User type" })
  @IsString()
  @IsNotEmpty()
  @IsEnum(["STUDENT", "TEACHER", "ADMIN"])
  user_type: string;
}

export class BulkNotificationDto {
  @ApiProperty({
    type: [UserRecipientDto],
    description: "List of recipients",
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserRecipientDto)
  recipients: UserRecipientDto[];

  @ApiProperty({
    example: "System Maintenance",
    description: "Notification title",
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: "System will be down for maintenance",
    description: "Notification message",
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ example: "SYSTEM", description: "Notification type" })
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

  @ApiPropertyOptional({ example: "MEDIUM", description: "Priority" })
  @IsOptional()
  @IsString()
  @IsEnum(["LOW", "MEDIUM", "HIGH", "URGENT"])
  priority?: string;

  @ApiPropertyOptional({ example: "system_alerts", description: "Category" })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    example: { maintenance_duration: "2 hours" },
    description: "Metadata",
  })
  @IsOptional()
  @IsObject()
  metadata?: any;
}
