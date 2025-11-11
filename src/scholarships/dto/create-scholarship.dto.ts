import {
  IsNumber,
  IsNotEmpty,
  IsEnum,
  IsDateString,
  Min,
  IsOptional,
  IsString,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateScholarshipDto {
  @ApiProperty({
    example: 1,
    description: "ID of the student",
  })
  @IsNumber()
  @IsNotEmpty()
  student_id: number;

  @ApiProperty({
    example: "STATE_STANDARD",
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
  @IsString()
  @IsNotEmpty()
  @IsEnum([
    "STATE_STANDARD",
    "PRESIDENTIAL",
    "NAMED_SCHOLARSHIP",
    "SOCIAL_SUPPORT",
    "PRIVATE_FUNDED",
    "RESEARCH_GRANT",
  ])
  scholarship_type: string;

  @ApiProperty({
    example: 500000,
    description: "Scholarship amount",
    minimum: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  amount: number;

  @ApiProperty({
    example: "2024-01-01",
    description: "Month of scholarship",
  })
  @IsDateString()
  @IsNotEmpty()
  month: string;

  @ApiProperty({
    example: "2024-01-01",
    description: "Year of scholarship",
  })
  @IsDateString()
  @IsNotEmpty()
  year: string;

  @ApiPropertyOptional({
    example: "Academic excellence scholarship",
    description: "Additional notes",
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
