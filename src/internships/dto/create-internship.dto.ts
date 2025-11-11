import {
  IsNumber,
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  IsEnum,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateInternshipDto {
  @ApiProperty({ example: 1, description: "Student ID" })
  @IsNumber()
  @IsNotEmpty()
  student_id: number;

  @ApiProperty({ example: "Google Inc.", description: "Organization name" })
  @IsString()
  @IsNotEmpty()
  organization_name: string;

  @ApiProperty({ example: "Software Engineer Intern", description: "Position" })
  @IsString()
  @IsNotEmpty()
  position: string;

  @ApiProperty({ example: "2024-06-01", description: "Start date" })
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @ApiProperty({ example: "2024-08-31", description: "End date" })
  @IsDateString()
  @IsNotEmpty()
  end_date: string;

  @ApiPropertyOptional({ example: "John Doe", description: "Supervisor name" })
  @IsOptional()
  @IsString()
  supervisor_name?: string;

  @ApiPropertyOptional({
    example: "john@google.com",
    description: "Supervisor contact",
  })
  @IsOptional()
  @IsString()
  supervisor_contact?: string;

  @ApiPropertyOptional({
    example: "Developing web applications",
    description: "Internship description",
  })
  @IsOptional()
  @IsString()
  description?: string;
}
