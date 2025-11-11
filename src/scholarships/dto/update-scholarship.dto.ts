import {
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  Min,
  IsString,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateScholarshipDto {
  @ApiPropertyOptional({
    example: 1,
    description: "ID of the student",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  student_id?: number;

  @ApiPropertyOptional({
    example: "PRESIDENTIAL",
    description: "Type of scholarship",
    enum: [
      "STATE_STANDARD",
      "PRESIDENTIAL",
      "NAMED_SCHOLARSHIP",
      "SOCIAL_SUPPORT",
      "PRIVATE_FUNDED",
      "RESEARCH_GRANT",
    ],
  })
  @IsOptional()
  @IsString()
  @IsEnum([
    "STATE_STANDARD",
    "PRESIDENTIAL",
    "NAMED_SCHOLARSHIP",
    "SOCIAL_SUPPORT",
    "PRIVATE_FUNDED",
    "RESEARCH_GRANT",
  ])
  scholarship_type?: string;

  @ApiPropertyOptional({
    example: 600000,
    description: "Scholarship amount",
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({
    example: "2024-02-01",
    description: "Month of scholarship",
  })
  @IsOptional()
  @IsDateString()
  month?: string;

  @ApiPropertyOptional({
    example: "2024-01-01",
    description: "Year of scholarship",
  })
  @IsOptional()
  @IsDateString()
  year?: string;

  @ApiPropertyOptional({
    example: "Updated scholarship notes",
    description: "Additional notes",
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
