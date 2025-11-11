import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsObject,
  IsUrl,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateNotificationDto {
  @ApiPropertyOptional({
    example: "Updated Exam Schedule",
    description: "Notification title",
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    example: "Updated message content",
    description: "Notification message",
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({
    example: "HIGH",
    description: "Priority level",
    enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["LOW", "MEDIUM", "HIGH", "URGENT"])
  priority?: string;

  @ApiPropertyOptional({
    example: { updated_data: true },
    description: "Additional metadata",
  })
  @IsOptional()
  @IsObject()
  metadata?: any;

  @ApiPropertyOptional({
    example: "/updated/url",
    description: "Action URL",
  })
  @IsOptional()
  @IsUrl()
  action_url?: string;

  @ApiPropertyOptional({
    example: true,
    description: "Read status",
  })
  @IsOptional()
  @IsBoolean()
  is_read?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: "Archive status",
  })
  @IsOptional()
  @IsBoolean()
  is_archived?: boolean;
}
